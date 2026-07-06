module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.32"

  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    main = {
      name           = "main-node-group"
      instance_types = ["c7i-flex.large"]

      min_size     = 2
      max_size     = 6
      desired_size = 3

      ami_id  = "ami-06259b63260eddc13"
      disk_size = 20

      labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }

      tags = {
        Name        = "ecommerce-node"
        Environment = var.environment
      }
    }
  }

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

# ── EBS CSI IAM Role ──
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name             = "${var.cluster_name}-ebs-csi-role"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }
}

# ── EBS CSI Addon ──
resource "aws_eks_addon" "ebs_csi" {
  cluster_name             = module.eks.cluster_name
  addon_name               = "aws-ebs-csi-driver"
  service_account_role_arn = module.ebs_csi_irsa.iam_role_arn

  depends_on = [
    module.eks.eks_managed_node_groups,
    module.ebs_csi_irsa
  ]
}

# ── Kubernetes Provider ──
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(
    module.eks.cluster_certificate_authority_data
  )

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      module.eks.cluster_name
    ]
  }
}

# ── StorageClass ──
resource "kubernetes_storage_class" "gp2" {
  metadata {
    name = "gp2"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }

  storage_provisioner    = "ebs.csi.aws.com"
  volume_binding_mode    = "WaitForFirstConsumer"
  reclaim_policy         = "Delete"
  allow_volume_expansion = true

  parameters = {
    type   = "gp2"
    fsType = "ext4"
  }

  depends_on = [aws_eks_addon.ebs_csi]
}
