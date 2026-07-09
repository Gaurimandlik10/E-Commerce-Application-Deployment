terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  backend "s3" {
   bucket = "devopsprojectsgauri"  
    key    = "ecommerce/terraform.tfstate"
    region = "ap-southeast-2"
  }
}


provider "aws" {
  region = var.region
}
data "aws_caller_identity" "current" {}
