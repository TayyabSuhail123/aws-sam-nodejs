FROM public.ecr.aws/lambda/nodejs:14
COPY app.js package*.json lambda.js ./
RUN npm install
CMD [ "lambda.handler" ]
