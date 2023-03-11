variable "AWS_ACCESS_KEY" {}
variable "AWS_REGION" {}
variable "AWS_SECRET_KEY" {}
variable "serp_api_key" {}
variable "discord_webhook_url" {}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.36.1"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }

  required_version = "~> 1.0"
}

provider "aws" {
  region     = var.AWS_REGION
  access_key = var.AWS_ACCESS_KEY
  secret_key = var.AWS_SECRET_KEY
}


data "archive_file" "CincyEventBot" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/dist/CincyEventBot.zip"
}

resource "aws_s3_object" "CincyEventBot" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "CincyEventBot.zip"
  source = data.archive_file.CincyEventBot.output_path
  etag   = filemd5(data.archive_file.CincyEventBot.output_path)

}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "cincyeventbot-build"
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

resource "aws_lambda_function" "CincyEventBot" {
  function_name    = "CincyEventBot"
  s3_bucket        = aws_s3_bucket.lambda_bucket.id
  s3_key           = aws_s3_object.CincyEventBot.key
  runtime          = "nodejs16.x"
  handler          = "index.handler"
  source_code_hash = data.archive_file.CincyEventBot.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  environment {
    variables = {
      discord_webhook_url = var.discord_webhook_url,
      serp_api_key        = var.serp_api_key
    }
  }
}

resource "aws_cloudwatch_log_group" "CincyEventBot" {
  name              = "/aws/lambda/${aws_lambda_function.CincyEventBot.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "CincyEventBot-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
