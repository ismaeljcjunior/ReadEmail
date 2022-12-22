const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const express = require('express')
const dbMysql = require('./config/dbMysql')
const { QueryTypes } = require('sequelize')
const logger = require('./utils/logger')
const app = express()
const notifier = require('mail-notifier');

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

function readEmail() {
    try {
        n.on('end', () => n.start()).on('mail', mail => {
            let mailSubject = mail.subject.toUpperCase().trim()
            let regExp = /[a-zA-Z]/g
            let date = new Date();
            let day = date.getDate();
            let month = date.getMonth();
            let year = date.getFullYear();;
            let hour = date.getHours(-3);
            let minute = date.getMinutes();
            let eventTime = hour + "," + minute
            let seconds = date.getSeconds();
            let milliseconds = date.getMilliseconds();
            let dateEvent = `${year}-${month}-${day}T${hour}:${minute}:${seconds}Z`

            if (mailSubject.includes('HDD ERROR')) {
                console.log('Evento de HDD ERROR')
                let error = 'HDD ERROR'
                let partition = parseInt(mailSubject.slice(6, 10).trim())
                let csid = mailSubject.slice(0, 4)
                let idEmp = mailSubject.slice(12, 18)

                async function sendDataBase() {
                    try {
                        await dbMysql.query(`
                                INSERT INTO eventos_dvr.events ( EMAIL_SUBJECT, PARTITION_,  CSID, ID_EMPRESA, EVENT_TYPE, DT_CREATED) VALUES ( '${mailSubject}', '${partition}','${csid}', '${idEmp}', '${error}', '${dateEvent}');
                            `)
                        console.log('Event inserted successfully');
                    } catch (e) {
                        console.log('error insert', e);
                    }
                } sendDataBase()

            }
            else if (mailSubject.includes('VIDEO SIGNAL LOST')) {
                console.log('EVENTO de VIDEO SIGNAL LOST')
                let csid = mailSubject.slice(0, 4)
                let partition = parseInt(mailSubject.slice(6, 10).trim())
                let idEmp = mailSubject.slice(12, 18)
                let error = 'VIDEO SIGNAL LOST'
                let channels = mailSubject.match(/[D]+[0-9]+/g)
                let repeat = 'REPETIDO'

                async function checkRepeatedEvent() {
                    try {
                        let num, num1, num2
                        const checkEvent = await dbMysql.query(`SELECT id_evento, CSID, PARTITION_, EVENT_TYPE, CHANNEL_ HOUR_EVENT FROM eventos_dvr.events order by id_evento asc limit 5;`, { type: dbMysql.QueryTypes.SELECT })
                        console.log('checkEvent', checkEvent)

                        num = checkEvent.at(0).HOUR_EVENT
                        console.log('num', num)
                        console.log('hour', hour)
                    } catch (e) {
                        console.log('error checkRepeatedEvent', e);
                    }
                } checkRepeatedEvent()

                async function sendDataBase() {
                    try {
                        await dbMysql.query(`
                                INSERT INTO eventos_dvr.events ( EMAIL_SUBJECT, CSID, PARTITION_, ID_EMPRESA, EVENT_TYPE, CHANNEL_, DT_CREATED, HOUR_EVENT) VALUES ( '${mailSubject}', '${csid}', '${partition}','${idEmp}', '${error}', '${channels}','${dateEvent}', '${eventTime}');
                            `)
                        console.log('Event inserted successfully');
                    } catch (e) {
                        console.log('error insert', e);
                    }
                } sendDataBase()
            }
            else {
                console.log('email desconsiderado: ', mailSubject);
            }
        }).start()
    } catch (e) {
        console.log('error', e)
    }
}
readEmail() 