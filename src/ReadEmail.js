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
  user: process.env.USER_EMAILTESTE,
  password: process.env.USER_PASSWORDTESTE,
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
          let csid = mailSubject.slice(0, 4).trim();
          let idEmp = mailSubject.slice(12, 18).trim();
          let status = "PENDENTE";
          let statusRepetido = "REPETIDO";
          let channels = '0000'
          
          async function checkRepeatedEvent() {
            let checkEvent_csid = csid;
            let checkEvent_TipoEvento = error;
            let checkEvent_Particao = partition;
            let checkEvent_idEmp = idEmp;

            try {
              const checkEventHDDERROR = await dbMysql.query( process.env.SELECT_1_HOUR_HDDERROR, { type: dbMysql.QueryTypes.SELECT }
              );
              
              for (const obj of checkEventHDDERROR) {
                if ( obj.CSID == checkEvent_csid &&  obj.TIPO_EVENTO == checkEvent_TipoEvento && obj.PARTICAO == checkEvent_Particao && obj.ID_EMPRESA == checkEvent_idEmp) {
                  console.log("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO, obj.PARTICAO, obj.ID_EMPRESA);
                  logger.info("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO, obj.PARTICAO, obj.ID_EMPRESA);
                  try {
                 
                    await dbMysql.query(`INSERT INTO evento_nvr_dvr.db_evento (EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, HORA_EVENTO, DT_CREATED) VALUES ('${mailSubject}', '${csid}', '${partition}', '${idEmp}', '${error}', '${channels}', '${statusRepetido}', '${eventTime}', CONVERT_TZ(NOW(), '+00:00', '-03:00'));`);
                  } catch (e) {
                    console.log("EVENTO SALVO, REPETIDO", e);
                    logger.info("EVENTO SALVO, REPETIDO", e);
                  }
                  return console.log("EVENTO JA CADASTRADO");  }
              }
              sendDataBaseHDDERROR()
            } catch (e) {
              console.log("ERROR SELECT CHECK EVENTO", e);
              logger.error("ERROR SELECT CHECK EVENTO", e);
            }
          } checkRepeatedEvent();

          async function sendDataBaseHDDERROR() {
            console.log('SALVANDO EVENTO');
            logger.info('SALVANDO EVENTO');
            try {
              await dbMysql.query(`INSERT INTO evento_nvr_dvr.db_evento (EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, HORA_EVENTO, DT_CREATED) VALUES ('${mailSubject}', '${csid}', '${partition}', '${idEmp}', '${error}', '${channels}', '${status}', '${eventTime}', CONVERT_TZ(NOW(), '+00:00', '-03:00'));`, { type: dbMysql.QueryTypes.INSERT });

              // await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}', '${status}', '${eventTime}')` );
              console.log("EVENTO SALVO COM SUCESSO");
              logger.info("EVENTO SALVO COM SUCESSO");
            } catch (e) {
              logger.error("Erro ao salvar evento", e);
            }
          } 
//----------------------------------------------------------------//        
        } else if (mailSubject.includes("VIDEO SIGNAL LOST")) {
          logger.info(mailSubject)
          logger.info("VIDEO SIGNAL LOST");
          console.log(mailSubject)
          console.log("VIDEO SIGNAL LOST");
          let csid = mailSubject.slice(0, 4);
          let partition = parseInt(mailSubject.slice(6, 10).trim());
          let idEmp = mailSubject.slice(12, 18).trim();
          let error = "VIDEO SIGNAL LOST";
          let channels = mailSubject.match(/[D]+[0-9]+/g);
          let status = "PENDENTE";
          let statusRepetido = "REPETIDO";

          async function checkRepeatedEvent() {
            let checkEvent_csid = csid;
            let checkEvent_channels = channels;
            let checkEvent_Particao = partition;
            let checkEvent_idEmp = idEmp;
            try {
              const checkEvent = await dbMysql.query( process.env.SELECT_1_HOUR_EVENT_SIGNAL_LOST,  { type: dbMysql.QueryTypes.SELECT }  );
              
              for (const obj of checkEvent) {
                if (
                  obj.CSID == checkEvent_csid &&
                  obj.CHANNEL == checkEvent_channels &&
                   obj.PARTICAO == checkEvent_Particao &&
                   obj.ID_EMPRESA == checkEvent_idEmp
                ) {
                  console.log("EVENTO REPETIDO", obj.CSID, obj.CHANNEL, obj.PARTICAO, obj.ID_EMPRESA);
                  logger.info("EVENTO REPETIDO", obj.CSID, obj.CHANNEL, obj.PARTICAO, obj.ID_EMPRESA);
                  try {
                    await dbMysql.query( `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${statusRepetido}',CONVERT_TZ(NOW(), '+00:00', '-03:00'), '${eventTime}');`, { type: dbMysql.QueryTypes.INSERT } );
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
                `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${status}',CONVERT_TZ(NOW(), '+00:00', '-03:00'), '${eventTime}');`
              );
              console.log("EVENTO SALVO COM SUCESSO");
              logger.info("EVENTO SALVO COM SUCESSO");
            } catch (e) {
              console.log("ERRO AO SALVAR EVENTO", e);
              logger.error("ERRO AO SALVAR EVENTO", e);
            }
          }
          // sendDataBase();
        } else if (mailSubject.includes("RECORDING EXCEPTION")){
          console.log(mailSubject);
          console.log("EVENTO de RECORDING EXCEPTION");
          logger.info(mailSubject);
          logger.info("EVENTO de RECORDING EXCEPTION");
          
          let csid = mailSubject.slice(0, 4).trim();
          let partition = parseInt(mailSubject.slice(6, 10).trim());
          let idEmp = mailSubject.slice(12, 18).trim();
          let error = "RECORDING EXCEPTION";
          let channels = mailSubject.match(/[D]+[0-9]+/g);
          let status = "PENDENTE";
          let statusRepetido = "REPETIDO";

          async function checkRepeatedEvent() {
            let checkEvent_csid = csid;
            let checkEvent_TipoEvento = error;
            let checkEvent_channel = channels;
            let checkEvent_Particao = partition;
            try {
              const checkEventRECORDEXCEPTION = await dbMysql.query( process.env.SELECT_1_HOUR_RECORD_EXCEPTION, { type: dbMysql.QueryTypes.SELECT });

              for (const obj of checkEventRECORDEXCEPTION) {
                if ( obj.CSID == checkEvent_csid &&  obj.TIPO_EVENTO == checkEvent_TipoEvento && obj.CHANNEL == checkEvent_channel && obj.PARTICAO == checkEvent_Particao) {
                  logger.info("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO,obj.CHANNEL, obj.PARTICAO);
                  console.log("EVENTO REPETIDO", obj.CSID, obj.TIPO_EVENTO,obj.CHANNEL, obj.PARTICAO);
                  try {
                    await dbMysql.query( `INSERT INTO DB_EVENTO ( EMAIL_SUBJECT, PARTICAO,  CSID, ID_EMPRESA, TIPO_EVENTO, DT_CREATED, STATUS, HORA_EVENTO) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', CONVERT_TZ(NOW(), '+00:00', '-03:00'), '${statusRepetido}', '${eventTime}')` );
                  } catch (e) {
                    console.log("ERRO AO SALVAR EVENTO", e);
                    logger.info("ERRO AO SALVAR EVENTO", e);
                  }
                  return console.log("EVENTO JA CADASTRADO");
                }
              }
              sendDataBaseRECORDEXCEPTION()
            } catch (e) {
              console.log("ERRO AO CONSULTAR EVENTO", e);
              logger.info("ERRO AO CONSULTAR EVENTO", e);
            }
          } checkRepeatedEvent();

          async function sendDataBaseRECORDEXCEPTION() {
            try {

              await dbMysql.query(
                `INSERT INTO db_evento ( EMAIL_SUBJECT, CSID, PARTICAO, ID_EMPRESA, TIPO_EVENTO, CHANNEL, STATUS, DT_CREATED, HORA_EVENTO) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}', '${status}',CONVERT_TZ(NOW(), '+00:00', '-03:00'), '${eventTime}');`
              );
              logger.info("EVENTO SALVO COM SUCESSO");
              console.log("EVENTO SALVO COM SUCESSO");
            } catch (e) {
              console.log("ERRO AO SALVAR EVENTO", e);
              logger.info("ERRO AO SALVAR EVENTO", e);
            }
          }; 

        }else {
          console.log("EMAIL DESCONSIDERADO: ", mailSubject);
          logger.info("EMAIL DESCONSIDERADO: ", mailSubject);
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
