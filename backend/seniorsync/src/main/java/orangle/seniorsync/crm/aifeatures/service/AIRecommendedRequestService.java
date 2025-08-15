package orangle.seniorsync.crm.aifeatures.service;

import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.aifeatures.client.LLMClient;
import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.mapper.SeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.aifeatures.repository.RequestsRankingRepository;

@Service
@Slf4j
public class AIRecommendedRequestService implements IAIRecommendedRequestService {
    private final SeniorRequestRepository seniorRequestRepository;
    private final RequestsRankingRepository requestsRankingRepository;
    private final SeniorRequestMapper seniorRequestMapper;
    private final LLMClient llmClient;

    public AIRecommendedRequestService(
            SeniorRequestRepository seniorRequestRepository,
            RequestsRankingRepository requestsRankingRepository,
            SeniorRequestMapper seniorRequestMapper,
            @Qualifier("claude") LLMClient llmClient
    ) {
        this.seniorRequestRepository = seniorRequestRepository;
        this.requestsRankingRepository = requestsRankingRepository;
        this.seniorRequestMapper = seniorRequestMapper;
        this.llmClient = llmClient;
    }

    @Override
    public AIRecommendedRequestDto getAllAIRecommendedRequests() {
        List<SeniorRequestDto> rankedRequests = getAllSeniorRequests();
        return new AIRecommendedRequestDto(rankedRequests);
    }

    @Override
    public AIRecommendedRequestDto getMyAIRecommendedRequests() {
        List<SeniorRequestDto> rankedRequests = getMyIncompletedSeniorRequests();
        return new AIRecommendedRequestDto(rankedRequests);
    }

    private List<SeniorRequestDto> getAllSeniorRequests() {
        List<SeniorRequest> seniorRequests = seniorRequestRepository.findAll();
        String prompt = buildPrompt(seniorRequests);
        String response = getRankedResponse(prompt);
        return parseAndRankRequests(response, seniorRequests);
    }

    private List<SeniorRequestDto> getMyIncompletedSeniorRequests() {
        // 🎯 This is how you'd get the current user ID
        Optional<Long> currentUserId = SecurityContextUtil.getCurrentUserId();
        Long userId = currentUserId.orElseThrow(() -> new IllegalStateException("No user logged in"));
        
        log.info("🔍 DEBUG: Current user ID: {}", userId);
        
        // Get incomplete requests for this user
        List<SeniorRequest> mySeniorRequests = seniorRequestRepository.findIncompleteRequestsByAssignedStaffId(userId);
        log.info("🔍 DEBUG: Found {} incomplete requests for user {}", mySeniorRequests.size(), userId);
        
        if (mySeniorRequests.isEmpty()) {
            log.warn("� DEBUG: No incomplete requests found for user {}. This could mean:", userId);
            log.warn("  1. User has no assigned requests");
            log.warn("  2. All user's requests are completed");
            log.warn("  3. User ID might not match any assigned_staff_id in database");
            return new ArrayList<>();
        }
        
        String prompt = buildPrompt(mySeniorRequests);
        String response = getRankedResponse(prompt);
        return parseAndRankRequests(response, mySeniorRequests);
    }


    private String buildPrompt(List<SeniorRequest> seniorRequests) {
        log.info("Building prompt for AI recommendations");

        StringBuilder prompt = new StringBuilder();
        prompt.append("Please rank the following senior care requests by priority based on urgency, severity, status and impact. ");
        prompt.append("Return the IDs in order of highest to lowest priority:\n\n");
        for(SeniorRequest request : seniorRequests) {
            prompt.append(String.format("ID: %d, Type: %s, Description: %s, Status: %s\n",
                    request.getId(),
                    request.getRequestTypeId(),
                    request.getDescription(),
                    request.getStatus()));
        }

        prompt.append("\nReturn only the IDs in comma-separated format, ordered by priority. Do not omit any IDs.\n");
        prompt.append("Example: 3,1,5,2,4\n");
        prompt.append("Do not include any text, explanations, or formatting. Just the numbers and commas.\n");
        log.info("Prompt: {}", prompt);
        log.info("Returning ranked ids");
        return prompt.toString();
    }

    private String getRankedResponse(String prompt) {
        return llmClient.callLLM(prompt);
    }

    // Returns a list of Senior Requests ranked by the llm
    private List<SeniorRequestDto> parseAndRankRequests(String llmResponse, List<SeniorRequest> originalRequests) {
        try {
            log.info("LLM Response: {}", llmResponse);
            log.info("Original requests: {}", originalRequests);
            String[] rankedIds = llmResponse.trim().split(",");
            log.info("Ranked Ids: {}", java.util.Arrays.toString(rankedIds));
            List<SeniorRequestDto> rankedRequests = new ArrayList<>();
            List<Long> processedIds = new ArrayList<>();

            for(String idStr : rankedIds) {
                Long id = Long.parseLong(idStr.trim());
                originalRequests.stream()
                        .filter(request -> request.getId().equals(id))
                        .findFirst()
                        .ifPresent(request -> {
                            rankedRequests.add(seniorRequestMapper.toDto(request));
                            processedIds.add(id);
                        });
            }

            originalRequests.stream()
                    .filter(request -> !processedIds.contains(request.getId()))
                    .forEach(request -> rankedRequests.add(seniorRequestMapper.toDto(request)));

            return rankedRequests;
        } catch (Exception e) {
            // Fallback to original order if parsing fails
            log.info("Fallback to original order. Error: " + e.getMessage());
            return originalRequests.stream()
                    .map(seniorRequestMapper::toDto)
                    .collect(Collectors.toList());
        }
    }
}