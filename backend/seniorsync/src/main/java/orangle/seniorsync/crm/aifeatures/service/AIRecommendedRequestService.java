package orangle.seniorsync.crm.aifeatures.service;

import orangle.seniorsync.common.service.AbstractCenterFilteredService;
import orangle.seniorsync.common.service.IUserContextService;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.aifeatures.client.LLMClient;
import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.mapper.SeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import orangle.seniorsync.crm.requestmanagement.spec.SeniorRequestSpecs;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.aifeatures.repository.RequestsRankingRepository;

@Service
@Slf4j
public class AIRecommendedRequestService extends AbstractCenterFilteredService<SeniorRequest, Long> implements IAIRecommendedRequestService {
    private final SeniorRequestRepository seniorRequestRepository;
    private final SeniorRequestMapper seniorRequestMapper;
    private final LLMClient llmClient;
    private final SanitiseRequestDetailsService sanitiseRequestDetailsService;

    public AIRecommendedRequestService(
            SeniorRequestRepository seniorRequestRepository,
            SeniorRequestMapper seniorRequestMapper,
            @Qualifier("claude") LLMClient llmClient,
            IUserContextService userContextService,
            SanitiseRequestDetailsService sanitiseRequestDetailsService
    ) {
        super(userContextService);
        this.seniorRequestRepository = seniorRequestRepository;
        this.seniorRequestMapper = seniorRequestMapper;
        this.llmClient = llmClient;
        this.sanitiseRequestDetailsService = sanitiseRequestDetailsService;
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
        List<SeniorRequest> seniorRequests = findAllWithCenterFilter(null);
        String prompt = buildPrompt(seniorRequests);
        String response = getRankedResponse(prompt);
        return parseAndRankRequests(response, seniorRequests);
    }

    private List<SeniorRequestDto> getMyIncompletedSeniorRequests() {
        // Use Cognito sub directly as the user identifier
        UUID currentUserCognitoSub = SecurityContextUtil.requireCurrentCognitoSubUUID();
        List<SeniorRequest> mySeniorRequests = seniorRequestRepository.findIncompleteRequestsByAssignedStaffCognitoSub(currentUserCognitoSub);
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
            String requestDetails = request.getDescription();
            String sanitisedDescription = sanitiseRequestDetailsService.sanitise(requestDetails);
            prompt.append(String.format("ID: %d, Type: %s, Description: %s, Status: %s\n",
                    request.getId(),
                    request.getRequestTypeId(),
                    sanitisedDescription,
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
            log.info("Ranked Ids: {}", Arrays.toString(rankedIds));
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

    @Override
    protected JpaSpecificationExecutor<SeniorRequest> getRepository() {
        return seniorRequestRepository;
    }

    @Override
    protected Specification<SeniorRequest> createCenterFilterSpec(Long centerId) {
        return SeniorRequestSpecs.belongsToCenter(centerId);
    }
}
