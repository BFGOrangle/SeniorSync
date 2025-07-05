package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.model.RequestComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestCommentRepository extends JpaRepository<RequestComment, Long>, JpaSpecificationExecutor<RequestComment> {
    List<RequestComment> findByRequestId(Long requestId);
}
