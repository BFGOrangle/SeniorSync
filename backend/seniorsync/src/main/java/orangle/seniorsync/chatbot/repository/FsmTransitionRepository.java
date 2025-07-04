package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.FsmTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;

public interface FsmTransitionRepository extends JpaRepository<FsmTransition, Long> {
    @Query("SELECT DISTINCT ft.campaignName FROM FsmTransition ft")
    List<String> findAllCampaignNames();

    @Query("SELECT DISTINCT ft.sourceState FROM FsmTransition ft WHERE ft.campaignName = ?1")
    Set<String> findAllSourceStateNamesByCampaignName(String campaignName);

    @Query("SELECT DISTINCT ft.destState FROM FsmTransition ft WHERE ft.campaignName = ?1")
    Set<String> findAllDestStateNamesByCampaignName(String campaignName);

    List<FsmTransition> findAllByCampaignName(String campaignName);
}
