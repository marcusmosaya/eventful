const bcrypt=require('bcrypt');
const fastCsv=require('fast-csv');
const xlsx=require('xlsx');
const fs=require('fs');
const nodemailer=require('nodemailer');
const { error } = require('console');



const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:"",
        pass:""
    }
})

function randomString(length,prefix){
    const characters='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result=prefix;
    for (let index = 0;index <length; index++) {
        const randomIndex=Math.floor(Math.random()*characters.length);
        result+=characters[randomIndex];
    }
    return result;
}

async function hashPassword(password) {
    let saltRounds=10;
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(password,saltRounds);
    }catch(error){
        console.error(error);
    }
    return hashedPassword;
}
async function comparePassword(password,dataBasePassword) {
    let validPassword;
    try{
         validPassword=await bcrypt.compare(password,dataBasePassword);
    }catch(error){
        console.error(error);
    }
    return validPassword;
}
function addRowToCsv(filePath,newRow){
   const rows=[];
   try{
    fs.createReadStream(filePath)
    .pipe(fastCsv.parse({headers:true}))
    .on('data',(row)=>rows.push(row))
    .on('end',()=>{
     rows.push(newRow);
     fastCsv.writeToPath(filePath,rows,{headers:true})
     .on('finish',()=>{
         console.log('Row added')
     })
    });
    return true;

   }catch(error){
    console.log(error)
    return flase;

   }
   
}
function removeRowFromCsv(filePath,condition){
    const rows=[];
    fs.createReadStream(filePath)
    .pipe(fastCsv.parse({headers:true}))
    .on('data',(row)=>{
        if (!condition(row)) {
            rows.push(row);
        }
    })
    .on('end',()=>{
        fastCsv.writeToPath(filePath,rows,{headers:true})
        .on('finish',()=>console.log('hiii'))
    });
}
function addRowToXlsx(eventId,newRow){
    filePath=`./events/${eventId}.xlsx`
    try{
        const workbook=xlsx.readFile(filePath);
        const sheetName=workbook.SheetNames[0];
        const worksheet=workbook.Sheets[sheetName];
        const data=xlsx.utils.sheet_to_json(worksheet);
        
        for (let index = 0; index < newRow.length; index++) {
            let exists=checkRowExistsXlsx(eventId,(row)=>row.emailPhone===newRow[index][0].emailPhone)
            if(!exists){
                data.push(newRow[index][0]);
            }
            
        }
        const newWorkSheet=xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName]=newWorkSheet;
        xlsx.writeFile(workbook,filePath);
        return true;
        
    }catch(error){
        console.log(error);
        return false;
    }
  
}
function removeRowFromXlsx(eventId,condition){
    filePath=`./events/${eventId}.xlsx`
    try{
        const workbook=xlsx.readFile(filePath);
        const sheetName=workbook.SheetNames[0];
        const worksheet=workbook.Sheets[sheetName];
        const data=xlsx.utils.sheet_to_json(worksheet);
    
        const filteredData=data.filter(row=>!condition(row));
        const newWorkSheet=xlsx.utils.json_to_sheet(filteredData);
        workbook.Sheets[sheetName]=newWorkSheet
        xlsx.writeFile(workbook,filePath);
        return true
    }catch(error){
        console.log(error);
        return false;
    }
    
} 
function readRowFromXlsx(eventId){
    filePath=`./events/${eventId}.xlsx`
    try{
        const workbook=xlsx.readFile(filePath);
        const sheetName=workbook.SheetNames[0];
        const worksheet=workbook.Sheets[sheetName];
        const data=xlsx.utils.sheet_to_json(worksheet);
        console.log(data);
        return data;
    }catch(error){
        console.log(error);
        return false;
    }
    
} 
async function updateRowInXlsx(eventId,previous,newData){
    removeRowFromXlsx(eventId,(row)=>row.emailPhone===previous);
    for (let index = 0; index < previous.length; index++) {
        await  removeRowFromXlsx(eventId,(row)=>row.emailPhone==previous[index]);        
    }
    addRowToXlsx(eventId,newData);
}

async function createXlsxFile(eventId){
  let filePath=`./events/${eventId}.xlsx`;

   headers=[['emailPhone']];
   try{
    const wb=xlsx.utils.book_new();
    const ws=xlsx.utils.aoa_to_sheet(headers);
    xlsx.utils.book_append_sheet(wb,ws,'Sheet1');
    xlsx.writeFile(wb,filePath);
    return true;
   }catch(error){
    console.log(error);
    return false;
   }
}

function checkRowExistsXlsx(eventId,condition){
    let filePath=`./events/${eventId}.xlsx`;
    try{
        const workbook=xlsx.readFile(filePath);
        const sheetName=workbook.SheetNames[0];
        const worksheet=workbook.Sheets[sheetName];
        const data=xlsx.utils.sheet_to_json(worksheet);
        const existingRow=data.filter(row=>condition(row));
        if(existingRow.length>0){
            return true;
        }
        return false;
    }catch(error){
        console.log(error);
        return false;
    }
}


function sendEmail(to,subject,text,html){
   const mailOptions={
    from:'',
    to:to,
    subject:subject,
    text:text,
    html:html,
   }
   transporter.sendMail(mailOptions,(error,info)=>{
    if(error){
        console.log(error);
        return false;
    }
    console.log('eail sent:',info.response);
    return true;
   })

}


module.exports={randomString,hashPassword,comparePassword,addRowToCsv,addRowToXlsx,removeRowFromCsv,removeRowFromXlsx,sendEmail,createXlsxFile,checkRowExistsXlsx,updateRowInXlsx,readRowFromXlsx};