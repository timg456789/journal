# Journal

## Delete

You must enter the document's date if you  wish to delete it. **This should be the first 15 characters or something to confirm the contents instead.** The document is deleted from s3, but not elastic. When the elastic index is rebuilt, the files are finally deleted. **A backup should automatically be performed prior to rebuilding the indexes.** However within s3, the document is deleted from the main bucket only and no longer appears when listing the objects in the console or in the list objects call. The document may be viewed from the AWS console in the replicated bucket as deleted.

## Save

Documents are saved to local storage on key press. Upon clicking the plus sign in the top right the document is saved to S3 then elasticsearch and removed from local storage. If S3 can't be reached you can continue to save documents and work offline. You have a 500,000k total character limit with an HTML5 browser. The documents will sync when the page loads with an internet connection or the save button is pushed when internet is available. Once the documents are sent they can be searched with the magnifying glass. You may also view a list of every document by date, click to view the full text, and delete, but not modify documents.

[Save Legend](https://timg456789.github.io/journal/docs/save-legend.md)

![Save Flow](https://timg456789.github.io/journal/docs/save-flow.jpg)

## Document

    {
        "content":"test",
        "time":"2017-05-07T01:56:31.924Z",
        "hash":"3c7ca2c51704ba514a4b6dfbe0c55e4a"
    }
    
### Encryption and Integrity
Documents are encrypted with [AES](http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html) after uploading to S3. AES was chosen over other encryption algorithms, because AES is supported by [cross-region replication](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr-what-is-isnot-replicated.html). The hash in the document is made up as shown below.
    
    hash = md5(content + timestamp)
    
*This is preferred over hashing the entire document, because there is room for additional metadata like a previous hash.*
  
## Supported Browsers (Latest Version)
Safari(iPhone)

Chrome

## Getting Started

### S3

1. Create an AWS s3 bucket `Cross-Region Replication`.

2. Create a `Programmatic Access` IAM user; saving the Access Keys.

3. Add a bucket policy to the primary bucket, granting permission to the new IAM user.

4. CORS with custom HTTP Headers e.g. md5Hash
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
    <AllowedHeader>x-amz-meta-metainfo</AllowedHeader>
</CORSRule>
</CORSConfiguration>

```
### Elastic Search

1. Create an elastic search domain.

2. Grant the `AmazonESFullAccess` policy to the new IAM user.
    a. Adding permissions through the canned template didn't work after much troubleshooting and the policies take about 15 minutes to change and debug any chages to the template. It's suggested to assign permissions directly through IAM for this reason.

3. Grant a trusted IP address access to the elastic search domain. This grants master access for manipulating documents. [Role and user based policy](https://timg456789.github.io/journal/docs/elasticsearch-access-policy-ip.json) example. [Ip based policy](https://timg456789.github.io/journal/docs/elasticsearch-access-policy-user-and-role.json) example.

4. Create a lambda function.
    a. Trigger the lambda function on the event type `Object Created (All)` for the primary S3 bucket.
    b. Download, configure, then upload the sample project for elastic search from github.

#### Create Index

URL: 'search-[DOMAIN].us-east-1.es.amazonaws.com/journal'

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

URL: 'search-[DOMAIN].us-east-1.es.amazonaws.com/journal/entry/`

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

Url: 'search-[DOMAIN].us-east-1.es.amazonaws.com/journal/_search`

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

# Journal Support

## Setup Create a personal.json file for test and script dependencies.

{
    "endpoint": "search-[DOMAIN].us-east-1.es.amazonaws.com/journal",
    "accessKeyId": "",
    "secretAccessKey": "",
    "bucket": "",
    "docType": ""
}

## npm test

1. Run JS in /tests
2. Save output to journal-support/test-output.txt

## npm run rebuild-search-index
Destroy and rebuild elastic search index from s3 objects.

## npm run backup
Directory structure is below. A non-standard UTC date format is used with time intervals from greatest to least for natural order.

    journal-support/backup/backu-data-2017-5-6-8-15-26-79-Z
        backup-document-2017-3-17-1-22-44-836-Z
        backup-document-2017-3-17-1-22-44-836-Z
        backup-document-2017-3-17-1-22-44-836-Z
