const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const dbMysql = require("./config/dbMysql");
const { QueryTypes } = require("sequelize");
const expressPinoLogger = require("express-pino-logger");
const logger = require("./utils/logger");
const app = express();
const notifier = require("mail-notifier");

const loggerMidleware = expressPinoLogger({
  logger: logger,
  autoLogging: true,
});

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
          console.log("Evento de HDD ERROR");
          console.log(mailSubject)
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
                  console.log("Pimba", obj.CSID, obj.TIPO_EVENTO);
                  try {
                    await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${statusRepetido}', '${eventTime}')` );
                  } catch (e) {
                    console.log("Error insertig repeat event", e);
                  }
                  return console.log("Evento já cadastrado");
                }
              }
              sendDataBaseHDDERROR()
            } catch (e) {
              console.log("error select check event", e);
            }
          } checkRepeatedEvent();

          async function sendDataBaseHDDERROR() {
            console.log('save event');
            try {
              await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${status}', '${eventTime}')` );
              console.log("Event inserted successfully");
            } catch (e) {
              console.log("error insert", e);
            }
          } 
//----------------------------------------------------------------//        
        } else if (mailSubject.includes("VIDEO SIGNAL LOST")) {
          console.log("EVENTO de VIDEO SIGNAL LOST");
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
              console.log;
              for (const obj of checkEvent) {
                if (
                  obj.CSID == checkEvent_csid &&
                  obj.CHANNEL == checkEvent_channels
                ) {
                  console.log("Pimba", obj.CSID, obj.CHANNEL);
                  try {
                    await dbMysql.query( `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${statusRepetido}','${dateEvent}', '${eventTime}');` );
                  } catch (e) {
                    console.log("Error insertig repeat event", e);
                  }
                  return console.log("Evento repetido");
                }
              }
              sendDataBaseVIDEOSIGNALLOST();
            } catch (e) {
              console.log("error select check event", e);
            }
          }
          checkRepeatedEvent();

          async function sendDataBaseVIDEOSIGNALLOST() {
            try {
              console.log("debug status", status);
              await dbMysql.query(
                `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${status}','${dateEvent}', '${eventTime}');`
              );
              console.log("Event inserted successfully");
            } catch (e) {
              console.log("error insert", e);
            }
          }
          // sendDataBase();
        } else if (mailSubject.includes("Recording Exception")){
          console.log("EVENTO de RECORDING EXCEPTION");
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

            try {
              const checkEventHDDERROR = await dbMysql.query( process.env.SELECT_1_HOUR_RECORD_EXCEPTION, { type: dbMysql.QueryTypes.SELECT }
              );
              
              for (const obj of checkEventHDDERROR) {
                if ( obj.CSID == checkEvent_csid &&  obj.TIPO_EVENTO == checkEvent_TipoEvento ) {
                  console.log("Pimba", obj.CSID, obj.TIPO_EVENTO);
                  try {
                    await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${statusRepetido}', '${eventTime}')` );
                  } catch (e) {
                    console.log("Error insertig repeat event", e);
                  }
                  return console.log("Evento já cadastrado");
                }
              }
              // sendDataBaseHDDERROR()
            } catch (e) {
              console.log("error select check event", e);
            }
          } checkRepeatedEvent();

        }else {
          console.log("email desconsiderado: ", mailSubject);
        }
      })
      .start();
  } catch (e) {
    console.log("error", e);
    logger.fatal("fatal", e);
  }
}
readEmail();
