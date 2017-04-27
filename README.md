# Journal

## Supported Browsers (Latest Version)
Safari
Chrome
HTML5 for basic functionality

## Save Routine

Documents are first saved to local storage then deployed to s3. If s3 can't be reached, then the documents will be deployed later. When the documents are later deployed, the text will be deployed using whatever the current configuration is with the time from the original save.

### Save Legend

Red = connected

Green = no connection

Orange = unsaved changes

Light Blue = saved locally

Dark Blue = saved remotely

### Save with No Connection

Red -> Orange -> Light Blue

### Save with Connection

Green -> Orange -> Light Blue -> Dark Blue

### No Connection with Existing Documents on Load

Red

### Connection with Existing Documents on Load

Green -> Dark Blue

![Save Flow](https://timg456789.github.io/journal/docs/save-flow.jpg)

## Running Tests

Create a file called personal.json in the root of the solution, which has been gitignored, like below:
```
{
    "endpoint": "search-[DOMAIN].us-east-1.es.amazonaws.com"
}
```
## Getting Started

### S3

1. Create an AWS s3 bucket `Cross-Region Replication`.

2. Create a `Programmatic Access` IAM user; saving the Access Keys.

3. Add a bucket policy to the primary bucket, granting permission to the new IAM user.

4. Enable CORS for GET and PUT
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```
### Elastic Search

1. Create an elastic search domain.

2. Grant the `AmazonESFullAccess` policy to the new IAM user.
    a. Adding permissions through the canned template didn't work after much troubleshooting and the policies take about 15 minutes to change and debug any chages to the template. It's suggested to assign permissions directly through IAM for this reason.

3. Grant a trusted IP address access to the elastic search domain. This grants master access for manipulating documents.
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*" /*permissions here appear to do nothing*/
      },
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:00000000:domain/your-elastic-domain/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "192.168.0.9"
        }
      }
    }
  ]
}
```
4. Create a lambda function.
    a. Trigger the lambda function on the event type `Object Created (All)` for the primary S3 bucket.
    b. Download, configure, then upload the sample project for elastic search from github.

#### Create Index

URL: `.es.amazonaws.com/journal`

Method: `POST`

Body
```
{
    "settings" : {
        "number_of_shards" : 5,
        "number_of_replicas" : 1
    }
}
```
Response
```
{
  "acknowledged": true,
  "shards_acknowledged": true
}
```
#### Create or Update Document

Method: `POST`

URL: `.es.amazonaws.com/journal/2017-01-05/`

Body
```
{
    "testing": "testing-123456789"
}
```
Response When New
```
{
  "_index": "journal",
  "_type": "2017-01-02",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": true
}
```
#### Search

Method: `POST`

Url: `.es.amazonaws.com/journal/_search`

Body
```
{
    "query" :
    {
	        "match": { "testing": "testing-2" }
    }
}
```
Response
```
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "hits": {
    "total": 28,
    "max_score": 2.6730378,
    "hits": [
      {
        "_index": "journal",
        "_type": "2017-01-05",
        "_id": "AVsShMeRNHck14Jwg7oo",
        "_score": 2.6730378,
        "_source": {
          "testing": "testing-2"
        }
      },
      {
        "_index": "journal",
        "_type": "2017-01-05",
        "_id": "AVsSg1W4NHck14Jwg7ol",
        "_score": 0.015604336,
        "_source": {
          "testing": "testing-123456789"
        }
      } /* and it goes on as a fuzzy search */
    ]
  }
}
```
## Autosave
At some point I need an auto save routine. At least to local storage.

## Deletions
Deletions need to be done manually within the AWS console.

`http://docs.aws.amazon.com/AmazonS3/latest/dev/DeletingObjectsfromVersioningSuspendedBuckets.html`
