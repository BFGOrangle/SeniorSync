package orangle.seniorsync.common.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StringArrayConverter implements AttributeConverter<String[], String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(String[] attribute) {
        if (attribute == null || attribute.length == 0) {
            return "[]"; // Return empty JSON array instead of null
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting array to JSON", e);
        }
    }

    @Override
    public String[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty() || "null".equals(dbData)) {
            return new String[0];
        }
        try {
            return objectMapper.readValue(dbData, String[].class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON to array", e);
        }
    }
}