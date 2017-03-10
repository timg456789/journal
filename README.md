# Fixes Required

## Legend
Desperately need a legend in order to describe the various transaction types that are described only by style.

## Credentials
An AWS public/private key can be used in the URL in order to create and return to new budgets. For example: ?pub=[ACCESS_KEY]&priv[SECRET_ACCESS_KEY]=&data=[OBJECT_NAME].json.

S3 read and write permissions are required for the bucket.

The bucket is hard-coded to `income-calculator`.

## Offending budget item
This would need to get added to the core processing.

# Supported Browsers
Latest versions of chrome, internet explorer, and safari for iPhone.

# Logs
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logStream:group=/aws/lambda/bitcoin-payment-scheduler;streamFilter=typeLogStreamPrefix

# Function
https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/bitcoin-payment-scheduler?tab=code

#vision
After using this application my financial status has continually improved. I have also found a correlation between money and peace; as well as the exact opposite.

I built this website out of necessity. I was fortunate enough to find a decent paying job out of college. However, I was living stricly paycheck to paycheck. Then one day my wages were garnished and I lost 25% of my income. After that I was forced to get serious about budgeting. I was already tired of living paycheck to paycheck, managing my expenses in my head, and the garnishment was the final straw.

Just looking at the budget after it has been loaded has been immensely helpful. Additional features are:
  - expense/income calendar
  - weekly aggregates
  - loan payoff date
  - loan interest calculator
