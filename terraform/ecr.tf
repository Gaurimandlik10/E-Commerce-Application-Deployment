resource "aws_ecr_repository" "react"{
    name = "ecommerce-react"
    force_delete = true
    tags = {
        Name = "ecommerce-react"
    }
}

resource "aws_ecr_repository" "node"{
    name = "ecommerce-node"
    force_delete = true
    tags = {
        Name = "ecommerce-node"
    }
}

output "react_ecr_url"{
    value = aws_ecr_repository.react.repository_url
}

output "node_ecr_url"{
    value = aws_ecr_repository.node.repository_url
}
