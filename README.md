# lambda-expressjs
Project inspired by https://github.com/kukielp/aws-sam-nodejs-express



How to deploy to AWS Lambda?

Ensure you have SAM installed and configured: https://aws.amazon.com/serverless/sam/

Then simply run

sam build
Then:

sam deploy -g
For subsequent builds use:

sam build && sam deploy
Enjoy your Serverless express app in AWS Lambda

