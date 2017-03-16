# Journal

## Getting Started

1. Create an AWS s3 bucket, then create another bucket in another region.

2. Enable versioning on both buckets.

4. Setup cross-region replication on one bucket, using the other bucket.

5. Create a `Programmatic Access` IAM user; saving the Access Keys.

6. Add a bucket policy to the primary bucket, granting permission to the new IAM user.
