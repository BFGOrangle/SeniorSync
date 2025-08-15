package orangle.seniorsync.crm.requestmanagement.service;

import lombok.RequiredArgsConstructor;
import orangle.seniorsync.crm.aifeatures.model.SpamDetectionResult;
import orangle.seniorsync.crm.aifeatures.repository.SpamDetectionResultRepository;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RequestMappingService {

    private final StaffRepository staffRepository;
    private final SpamDetectionResultRepository spamDetectionResultRepository;
    private final RequestTypeRepository requestTypeRepository;

    public String getRequestTypeName(Long requestTypeId) {
        if (requestTypeId == null) {
            return null;
        }
        return requestTypeRepository.findById(requestTypeId)
                .map(requestType -> requestType.getName())
                .orElse(null);
    }

    public String getStaffName(Long assignedStaffId) {
        if (assignedStaffId == null) {
            return null;
        }
        return staffRepository.findById(assignedStaffId)
                .map(staff -> staff.getFirstName() + " " + staff.getLastName())
                .orElse(null);
    }

    public Boolean getSpamStatus(Long requestId) {
        if (requestId == null) return null;
        return getLatestSpamDetection(requestId)
                .map(SpamDetectionResult::getIsSpam)
                .orElse(null);
    }

    public BigDecimal getSpamConfidence(Long requestId) {
        if (requestId == null) return null;
        return getLatestSpamDetection(requestId)
                .map(SpamDetectionResult::getConfidenceScore)
                .orElse(null);
    }

    public String getSpamReason(Long requestId) {
        if (requestId == null) return null;
        return getLatestSpamDetection(requestId)
                .map(SpamDetectionResult::getDetectionReason)
                .orElse(null);
    }

    public OffsetDateTime getSpamDetectedAt(Long requestId) {
        if (requestId == null) return null;
        return getLatestSpamDetection(requestId)
                .map(SpamDetectionResult::getDetectedAt)
                .orElse(null);
    }

    private Optional<SpamDetectionResult> getLatestSpamDetection(Long requestId) {
        return spamDetectionResultRepository.findTopByRequestIdOrderByDetectedAtDesc(requestId);
    }
}
