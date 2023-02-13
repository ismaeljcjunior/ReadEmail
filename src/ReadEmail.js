const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const dbMysql = require("./config/dbMysql");
const { QueryTypes } = require("sequelize");
const expressPinoLogger = require("express-pino-logger");
const logger = require("./utils/logger");
const notifier = require("mail-notifier");


const loggerMidleware = expressPinoLogger({
  logger: logger,
  autoLogging: true,
});
const app = express();
app.use(express.json());
app.use(loggerMidleware);

const imap = {
  user: process.env.USER_EMAIL,
  password: process.env.USER_PASSWORD,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};
const n = notifier(imap);

function readEmail() {

  try {
    n.on("end", () => n.start())
      .on("mail", (mail) => {
        let mailSubject = mail.subject.toUpperCase().trim();
        let regExp = /[a-zA-Z]/g;
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        let hour = date.getHours(-3);
        let minute = date.getMinutes();
        let eventTime = hour + "." + minute;
        let seconds = date.getSeconds();
        let milliseconds = date.getMilliseconds();
        let dateEvent = `${year}-${month}-${day}T${hour}:${minute}:${seconds}Z`;
  
        if (mailSubject.includes("HDD ERROR")) {
          logger.info(mailSubject)
          logger.info("Evento de HDD ERROR");
          console.log(mailSubject)
          console.log("Evento de HDD ERROR");
          let error = "HDD ERROR";
          let partition = parseInt(mailSubject.slice(6, 10).trim());
          let csid = mailSubject.slice(0, 4);
          let idEmp = mailSubject.slice(12, 18);
          let status = "PENDENTE";
          let statusRepetido = "REPETIDO";

          async function checkRepeatedEvent() {
            let checkEvent_csid = csid;
            let checkEvent_TipoEvento = error;

            try {
              const checkEventHDDERROR = await dbMysql.query( process.env.SELECT_1_HOUR_HDDERROR, { type: dbMysql.QueryTypes.SELECT }
              );
              
              for (const obj of checkEventHDDERROR) {
                if ( obj.CSID == checkEvent_csid &&  obj.TIPO_EVENTO == checkEvent_TipoEvento ) {
                  console.log("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO);
                  logger.info("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO);
                  try {
                    await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${statusRepetido}', '${eventTime}')` );
                  } catch (e) {
                    console.log("Error insertig repeat event", e);
                    logger.info("Error insertig repeat event", e);
                  }
                  return console.log("Evento já cadastrado");                }
              }
              sendDataBaseHDDERROR()
            } catch (e) {
              console.log("error select check event", e);
              logger.error("error select check event", e);
            }
          } checkRepeatedEvent();

          async function sendDataBaseHDDERROR() {
            console.log('save event');
            logger.info('save event');
            try {
              await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${status}', '${eventTime}')` );
              console.log("Evento salvo com sucesso");
              logger.info("Evento salvo com sucesso");
            } catch (e) {
              logger.error("Erro ao salvar evento", e);
            }
          } 
//----------------------------------------------------------------//        
        } else if (mailSubject.includes("VIDEO SIGNAL LOST")) {
          console.log("EVENTO de VIDEO SIGNAL LOST");
          logger.info("EVENTO de VIDEO SIGNAL LOST");
          let csid = mailSubject.slice(0, 4);
          let partition = parseInt(mailSubject.slice(6, 10).trim());
          let idEmp = mailSubject.slice(12, 18);
          let error = "VIDEO SIGNAL LOST";
          let channels = mailSubject.match(/[D]+[0-9]+/g);
          let status = "PENDENTE";
          let statusRepetido = "REPETIDO";

          async function checkRepeatedEvent() {
            let checkEvent_csid = csid;
            let checkEvent_channels = channels;

            try {
              const checkEvent = await dbMysql.query(
                process.env.SELECT_1_HOUR_EVENT_SIGNAL_LOST,
                { type: dbMysql.QueryTypes.SELECT }
              );
              
              for (const obj of checkEvent) {
                if (
                  obj.CSID == checkEvent_csid &&
                  obj.CHANNEL == checkEvent_channels
                ) {
                  console.log("EVENTO REPETIDO", obj.CSID, obj.CHANNEL);
                  logger.info("EVENTO REPETIDO", obj.CSID, obj.CHANNEL);
                  try {
                    await dbMysql.query( `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${statusRepetido}','${dateEvent}', '${eventTime}');` );
                  } catch (e) {
                    console.log("Erro ao salvar evento", e);
                    logger.info("Erro ao salvar evento", e);
                  }
                  return console.log("Evento repetido");
                }
              }
              sendDataBaseVIDEOSIGNALLOST();
            } catch (e) {
              console.log("Erro consultar evento", e);
              logger.info("Erro consultar evento", e);
            }
          }
          checkRepeatedEvent();

          async function sendDataBaseVIDEOSIGNALLOST() {
            try {

              await dbMysql.query(
                `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${status}','${dateEvent}', '${eventTime}');`
              );
              console.log("Evento salvo com sucesso");
              logger.info("Evento salvo com sucesso");
            } catch (e) {
              console.log("Erro ao salvar evento", e);
              logger.error("Erro ao salvar evento", e);
            }
          }
          // sendDataBase();
        } else if (mailSubject.includes("RECORDING EXCEPTION")){
          console.log(mailSubject);
          console.log("EVENTO de RECORDING EXCEPTION");
          logger.info(mailSubject);
          logger.info("EVENTO de RECORDING EXCEPTION");
          
          let csid = mailSubject.slice(0, 4);
          let partition = parseInt(mailSubject.slice(6, 10).trim());
          let idEmp = mailSubject.slice(12, 18);
          let error = "RECORDING EXCEPTION";
          let channels = mailSubject.match(/[D]+[0-9]+/g);
          let status = "PENDENTE";
          let statusRepetido = "REPETIDO";

          async function checkRepeatedEvent() {
            let checkEvent_csid = csid;
            let checkEvent_TipoEvento = error;
            let checkEvent_channel = channels;

            try {
              const checkEventRECORDEXCEPTION = await dbMysql.query( process.env.SELECT_1_HOUR_RECORD_EXCEPTION, { type: dbMysql.QueryTypes.SELECT });

              for (const obj of checkEventRECORDEXCEPTION) {
                if ( obj.CSID == checkEvent_csid &&  obj.TIPO_EVENTO == checkEvent_TipoEvento && obj.CHANNEL == checkEvent_channel) {
                  logger.info("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO);
                  console.log("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO);
                  try {
                    await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${statusRepetido}', '${eventTime}')` );
                  } catch (e) {
                    console.log("Erro ao salvar evento", e);
                    logger.info("Erro ao salvar evento", e);
                  }
                  return console.log("Evento já cadastrado");
                }
              }
              sendDataBaseRECORDEXCEPTION()
            } catch (e) {
              console.log("Erro consultar evento", e);
              logger.info("Erro consultar evento", e);
            }
          } checkRepeatedEvent();

          async function sendDataBaseRECORDEXCEPTION() {
            try {

              await dbMysql.query(
                `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${status}','${dateEvent}', '${eventTime}');`
              );
              logger.info("Evento salvo com sucesso");
              console.log("Evento salvo com sucesso");
            } catch (e) {
              console.log("Erro ao salvar evento", e);
              logger.info("Erro ao salvar evento", e);
            }
          }; 

        }else {
          console.log("email desconsiderado: ", mailSubject);
          logger.info("email desconsiderado: ", mailSubject);
        }
      })
      .start();
  } catch (e) {
    console.log("error", e);
    logger.fatal("fatal", e);
  }
}
readEmail();

app.get('/', async(req, res) =>{
  res.send({Status: 200, Message: 'alive'})
})
app.listen(process.env.PORT, () => {
  console.log(`Servidor readEmail on port ${process.env.PORT}`);
});
