const express = require('express')
const cors = require('cors')
const dbMysql = require('./config/dbMysql')
const logger = require('./utils/logger')
const port = 3333; //porta padrão
const app = express()

app.use(cors())
app.use(express.json())

const notifier = require('mail-notifier');

const imap = {
    user: "desenvolvimento@newlineseguranca.com.br",
    password: "d3s3nv0l#NL",
    host: "email-ssl.com.br",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};
const n = notifier(imap);

n.on('end', () => n.start()).on('mail', mail => {
    let mailSubject = mail.subject.toUpperCase().trim()

    console.log(typeof mailSubject)

    // if (mailSubject.includes('HDD ERROR')) {
    //     console.log('erro de HDD ERROR')
    //     let csid = mailSubject.slice(0, 4)
    //     let partition = mailSubject.slice(6, 10).trim()
    //     let error = 'HDD ERROR'

    //     async function sendDataBase1() {
    //         try {
    //             await dbMysql.query(`
    //             INSERT INTO eventos_dvr.events ( EMAIL_SUBJECT, CSID,  EVENT_TYPE, DT_CREATED) VALUES ( '${mailSubject}', '${csid}', '${error}', NOW());
    //         `)
    //             console.log('Insert sucefully');
    //         } catch (e) {
    //             console.log('error insert', e);
    //         }
    //     } sendDataBase1()
    //     console.log('csid', csid + ' partition ' + partition)
    // }
    // else if (mailSubject.includes('VIDEO SIGNAL LOST')) {
    //     console.log('erro de VIDEO SIGNAL LOST')
    //     let csid = mailSubject.slice(0, 4)
    //     let partition = mailSubject.slice(6, 10).trim()
    //     let error = 'VIDEO SIGNAL LOST'
    //     let channels = mailSubject.match(/[D]+[0-9]+/g)

    //     async function sendDataBase() {
    //         try {
    //             await dbMysql.query(`
    //             INSERT INTO eventos_dvr.events ( EMAIL_SUBJECT, CSID, PARTITION_, EVENT_TYPE, CHANNEL_, DT_CREATED) VALUES ( '${mailSubject}', '${csid}', '${partition}', '${error}', '${channels}', NOW());
    //         `)
    //             console.log('Insert sucefully');
    //         } catch (e) {
    //             console.log('error insert', e);
    //         }
    //     } sendDataBase()
    //     console.log('CSID: ', csid + ' partition: ' + partition + ' error: ' + error + ' channels: ' + channels)
    // } 
    // else{
    //     console.log('email com evento desconsiderados: ', mailSubject);
    // }
}).start();
