package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SeniorRequestDraftRepository extends JpaRepository<SeniorRequestDraft, Long>, JpaSpecificationExecutor<SeniorRequest> {
}