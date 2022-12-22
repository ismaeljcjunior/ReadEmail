const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const express = require('express')
const cors = require('cors')
const dbMysql = require('./config/dbMysql')
const logger = require('./utils/logger')
const app = express()
const notifier = require('mail-notifier');

app.use(cors())
app.use(express.json())

const imap = {
    user: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};
const n = notifier(imap)

n.on('end', () => n.start()).on('mail', mail => {
    let mailSubject = mail.subject.toUpperCase().trim()
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();;
    let hour = date.getHours(-3);
    let minute = date.getMinutes();
    let seconds = date.getSeconds();
    let milliseconds = date.getMilliseconds();
    let dateEvent = `${year}-${month}-${day}T${hour}:${minute}:${seconds}Z`

    if (mailSubject.includes('HDD ERROR')) {
        console.log('erro de HDD ERROR')
        let error = 'HDD ERROR'
        let partition = parseInt(mailSubject.slice(6, 10).trim())
        let csid = mailSubject.slice(0, 4)
        let idEmp = mailSubject.slice(12, 18)

        async function sendDataBase() {
            try {
                await dbMysql.query(`
                        INSERT INTO eventos_dvr.events ( EMAIL_SUBJECT, PARTITION_,  CSID, ID_EMPRESA, EVENT_TYPE, DT_CREATED) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}');
                    `)
                console.log('Insert sucefully');
            } catch (e) {
                console.log('error insert', e);
            }
        } sendDataBase()

    }
    else if (mailSubject.includes('VIDEO SIGNAL LOST')) {
        console.log('erro de VIDEO SIGNAL LOST')
        let csid = mailSubject.slice(0, 4)
        let partition = parseInt(mailSubject.slice(6, 10).trim())
        let idEmp = mailSubject.slice(12, 18)
        let error = 'VIDEO SIGNAL LOST'
        let channels = mailSubject.match(/[D]+[0-9]+/g)

        async function sendDataBase() {
            try {
                await dbMysql.query(`
                        INSERT INTO eventos_dvr.events ( EMAIL_SUBJECT, CSID, PARTITION_, ID_EMPRESA, EVENT_TYPE, CHANNEL_,DT_CREATED) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}','${dateEvent}');
                    `)
                console.log('Insert sucefully');
            } catch (e) {
                console.log('error insert', e);
            }
        } sendDataBase()

    }
    else {
        console.log('email com evento desconsiderado: ', mailSubject);
    }
}).start()