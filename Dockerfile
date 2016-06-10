FROM node:4.4.4

ENV WD=/opt/kibana

WORKDIR $WD

COPY . $WD

RUN npm install

CMD [ "/opt/kibana/bin/kibana", "-q" ]

EXPOSE 5601
