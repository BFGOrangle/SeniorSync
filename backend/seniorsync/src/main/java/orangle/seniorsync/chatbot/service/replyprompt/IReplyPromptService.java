package orangle.seniorsync.chatbot.service.replyprompt;

public interface IReplyPromptService {
    String getReplyPrompt(String campaignName, String state, String languageCode);
}