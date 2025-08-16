package orangle.seniorsync.crm.staffmanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;

    @Value("${cognito.user-pool-id}")
    private String userPoolId;

    @Value("${cognito.app-client-id}")
    private String appClientId;

    public Optional<AdminCreateUserResponse> createUser(String username, String email,
                                                        String temporaryPassword, Map<String, String> userAttributes) {
        try {
            // Build attribute list (email is required)
            var attributesBuilder = AttributeType.builder()
                    .name("email")
                    .value(email);

            var attributes = List.of(attributesBuilder.build());

            // Add email_verified=true to auto-verify email on creation
            var allAttributes = new java.util.ArrayList<>(attributes);
            allAttributes.add(AttributeType.builder()
                    .name("email_verified")
                    .value("true")
                    .build());

            // Add additional / custom attributes (given_name, family_name, custom:center_id, etc.)
            if (userAttributes != null && !userAttributes.isEmpty()) {
                userAttributes.forEach((key, value) ->
                        allAttributes.add(AttributeType.builder()
                                .name(key)
                                .value(value)
                                .build())
                );
            }
            attributes = allAttributes; // reassign with full list including email_verified

            // IMPORTANT: desiredDeliveryMediums(EMAIL) ensures the invite email is sent (unless suppressed)
            AdminCreateUserRequest request = AdminCreateUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .userAttributes(attributes)
                    .temporaryPassword(temporaryPassword) // keep temp so user is FORCE_CHANGE_PASSWORD
                    .desiredDeliveryMediums(DeliveryMediumType.EMAIL)
                    .forceAliasCreation(true)
                    .build();

            AdminCreateUserResponse response = cognitoClient.adminCreateUser(request);
            String userStatus = response.user() != null ? response.user().userStatusAsString() : "UNKNOWN";
            log.info("Successfully created Cognito user: {} with status {} (expected FORCE_CHANGE_PASSWORD)", username, userStatus);

            return Optional.of(response);

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to create Cognito user {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to create user in Cognito", e);
        }
    }

    public Optional<AdminGetUserResponse> getUser(String username) {
        try {
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build();

            AdminGetUserResponse response = cognitoClient.adminGetUser(request);
            return Optional.of(response);

        } catch (UserNotFoundException e) {
            log.debug("User not found in Cognito: {}", username);
            return Optional.empty();
        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to get Cognito user {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to retrieve user from Cognito", e);
        }
    }

    public boolean updateUserAttributes(String username, Map<String, String> attributes) {
        try {
            var attributeList = attributes.entrySet().stream()
                    .map(entry -> AttributeType.builder()
                            .name(entry.getKey())
                            .value(entry.getValue())
                            .build())
                    .toList();

            AdminUpdateUserAttributesRequest request = AdminUpdateUserAttributesRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .userAttributes(attributeList)
                    .build();

            cognitoClient.adminUpdateUserAttributes(request);
            log.info("Successfully updated attributes for Cognito user: {}", username);

            return true;

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to update attributes for Cognito user {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to update user attributes in Cognito", e);
        }
    }

    public boolean removeUserFromGroup(String usernameOrEmail, String groupName) {
        try {
            String cleanUsernameOrEmail = usernameOrEmail.trim();
            String cleanGroupName = groupName.trim();

            AdminRemoveUserFromGroupRequest request = AdminRemoveUserFromGroupRequest.builder()
                    .userPoolId(userPoolId)
                    .username(cleanUsernameOrEmail) // Can be username or email due to alias configuration
                    .groupName(cleanGroupName)
                    .build();

            cognitoClient.adminRemoveUserFromGroup(request);
            log.info("Successfully removed user {} from group {}", cleanUsernameOrEmail, cleanGroupName);

            return true;

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to remove user {} from group {}: {}", usernameOrEmail, groupName, e.getMessage());
            throw new RuntimeException("Failed to remove user from group in Cognito", e);
        }
    }

    public boolean addUserToGroup(String usernameOrEmail, String groupName) {
        try {
            String cleanUsernameOrEmail = usernameOrEmail.trim();
            String cleanGroupName = groupName.trim();

            AdminAddUserToGroupRequest request = AdminAddUserToGroupRequest.builder()
                    .userPoolId(userPoolId)
                    .username(cleanUsernameOrEmail)
                    .groupName(cleanGroupName)
                    .build();

            cognitoClient.adminAddUserToGroup(request);
            log.info("Successfully added user {} to user group {}", cleanUsernameOrEmail, cleanGroupName);

            return true;

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to add user {} to user group {}: {}", usernameOrEmail, groupName, e.getMessage());
            throw new RuntimeException("Failed to add user to group in Cognito", e);
        }
    }

    public boolean setUserPassword(String username, String password) {
        try {
            AdminSetUserPasswordRequest request = AdminSetUserPasswordRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .password(password)
                    .permanent(true)
                    .build();

            cognitoClient.adminSetUserPassword(request);
            log.info("Successfully set permanent password for user: {}", username);

            return true;

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to set password for user {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to set user password in Cognito", e);
        }
    }

    /**
     * Disable a user account
     *
     * @param username The username
     * @return true if successful
     */
    public boolean disableUser(String username) {
        try {
            AdminDisableUserRequest request = AdminDisableUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build();

            cognitoClient.adminDisableUser(request);
            log.info("Successfully disabled user: {}", username);
            return true;

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to disable user {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to disable user in Cognito", e);
        }
    }

    public boolean enableUser(String username) {
        try {
            AdminEnableUserRequest request = AdminEnableUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build();

            cognitoClient.adminEnableUser(request);
            log.info("Successfully enabled user: {}", username);

            return true;

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to enable user {}: {}", username, e.getMessage());
            return false;
        }
    }

    public List<UserType> listUsersInGroup(String groupName) {
        try {
            ListUsersInGroupRequest request = ListUsersInGroupRequest.builder()
                    .userPoolId(userPoolId)
                    .groupName(groupName)
                    .build();

            ListUsersInGroupResponse response = cognitoClient.listUsersInGroup(request);
            return response.users();

        } catch (CognitoIdentityProviderException e) {
            log.error("Failed to list users in group {}: {}", groupName, e.getMessage());
            throw new RuntimeException("Failed to list users in group in Cognito", e);
        }
    }
}
