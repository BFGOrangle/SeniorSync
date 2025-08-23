# IAM Role for Cognito to send SMS via SNS
resource "aws_iam_role" "cognito_sns_role" {
  name = "cognito-sns-role-${var.environment}"
  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Service": "cognito-idp.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cognito_sns_policy" {
  name = "cognito-sns-policy-${var.environment}"
  role = aws_iam_role.cognito_sns_role.id
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "*"
    }]
  })
}

resource "aws_cognito_user_pool" "cognito" {
  name                     = var.user_pool_name
  auto_verified_attributes = ["email", "phone_number"]
  
  alias_attributes = ["email", "phone_number"]

  # To temporarily disable MFA
  mfa_configuration = "OFF"

  # Keep sms_configuration only for phone/email verification (NOT MFA). This is safe with mfa_configuration = OFF.
  sms_configuration {
    external_id    = var.project_name  # Use project name only like working config
    sns_caller_arn = aws_iam_role.cognito_sns_role.arn
  }

  # T0 temporarily disable MFA
  # software_token_mfa_configuration {
  #   enabled = false
  # }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # Define custom attributes
  schema {
    attribute_data_type      = "Number"
    developer_only_attribute = false
    mutable                  = true
    name                     = "center_id"
    required                 = false

    number_attribute_constraints {
      min_value = 1
      max_value = 999999999
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 1
    }
    recovery_mechanism {
      name     = "verified_email"
      priority = 2
    }
  }

  sms_verification_message = "Your SeniorSync verification code is: {####}"

  admin_create_user_config {
    allow_admin_create_user_only = true
    invite_message_template {
      email_message = "Hello {username}, your SeniorSync account has been created. Your temporary password is {####}. Please sign in using your email and temporary password."
      email_subject = "Welcome to SeniorSync"
      sms_message   = "Hello {username}, your SeniorSync temporary password is {####}"
    }
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name             = "${var.user_pool_name}-client-${var.environment}"
  user_pool_id     = aws_cognito_user_pool.cognito.id

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                   = ["code", "implicit"]
  allowed_oauth_scopes                  = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_CUSTOM_AUTH"
  ]

  # Token validity settings optimized for security
  access_token_validity = 30
  id_token_validity = 30
  refresh_token_validity = 1

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes" 
    refresh_token = "days"
  }

  # Prevent user existence errors for security
  prevent_user_existence_errors = "ENABLED"
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain      = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.cognito.id
}

resource "aws_cognito_user_group" "admin_group" {
  user_pool_id = aws_cognito_user_pool.cognito.id
  name         = "ADMIN"
  description  = "Group for admin users who can manage staff and centers"
}

resource "aws_cognito_user_group" "staff_group" {
  user_pool_id = aws_cognito_user_pool.cognito.id
  name         = "STAFF"
  description  = "Group for staff users who can access their assigned center"
}

# Create a root admin user
resource "aws_cognito_user" "root_admin" {
  user_pool_id             = aws_cognito_user_pool.cognito.id
  password                 = var.root_admin_password
  username                 = "rootadmin"
  desired_delivery_mediums = ["EMAIL"]

  attributes = {
    email          = var.root_admin_email
    email_verified = "true"
    phone_number   = var.root_admin_phone_number
    phone_number_verified = "true"
    "custom:center_id" = "1"
  }

  lifecycle {
    ignore_changes = [password]
  }
}

# Add the root admin user to the ADMIN group
resource "aws_cognito_user_in_group" "root_admin_membership" {
  user_pool_id = aws_cognito_user_pool.cognito.id
  username     = aws_cognito_user.root_admin.username
  group_name   = aws_cognito_user_group.admin_group.name
}