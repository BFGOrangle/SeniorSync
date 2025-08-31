package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.model.CommentMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentMentionRepository extends JpaRepository<CommentMention, Long> {
    
    /**
     * Find all mentions for a specific comment
     */
    List<CommentMention> findByCommentId(Long commentId);
    
    /**
     * Find all mentions for a specific staff member
     */
    List<CommentMention> findByMentionedStaffId(Long staffId);
    
    /**
     * Find all mentions for a specific comment with staff details
     */
    @Query("""
        SELECT cm FROM CommentMention cm 
        WHERE cm.commentId = :commentId
        ORDER BY cm.createdAt ASC
        """)
    List<CommentMention> findMentionsByCommentId(@Param("commentId") Long commentId);
    
    /**
     * Delete all mentions for a specific comment (used when comment is deleted)
     */
    void deleteByCommentId(Long commentId);
    
    /**
     * Check if a staff member is mentioned in a specific comment
     */
    boolean existsByCommentIdAndMentionedStaffId(Long commentId, Long staffId);
}