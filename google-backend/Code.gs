/** TailorBird Order Receiver - deploy as Google Apps Script Web App.
 * SECURITY: public customer endpoint, do not put Google credentials in GitHub.
 * Simple honeypot, LockService, server-side validation, and unique order IDs.
 * For production, add abuse protection & switch to scalable storage for large files.
 */
const OWNER_EMAILS = ['mmh6491@gmail.com', 'tailorbirdbangladesh@gmail.com'];
const FOLDER_NAME = 'TailorBird Customer Orders';
const SHEET_NAME = 'TailorBird Orders';
function prop(key){return PropertiesService.getScriptProperties().getProperty(key)||'';}
function doPost(e){
  let nonce='';
  try {
    const raw=e.parameter.payload||'';
    if(raw.length>12500000)throw Error('Request too large; reduce attachments.');
    const order=JSON.parse(raw);nonce=String(order.nonce||'');
    const d=order.details;
    if(!d||!String(d.team||'').trim()||!String(d.customer||'').trim()||!String(d.phone||'').trim())throw Error('Required customer details are missing.');
    if(!Array.isArray(order.files))throw Error('Invalid files.');
    const lock=LockService.getScriptLock();lock.waitLock(30000);
    let id;
    try {
      const stamp=Utilities.formatDate(new Date(),'Asia/Dhaka','yyyyMMdd');
      const p=PropertiesService.getScriptProperties(), k='NEXT_'+stamp;
      const seq=Number(p.getProperty(k)||'0')+1;p.setProperty(k,String(seq));
      id='TB-'+stamp+'-'+String(seq).padStart(3,'0');
    } finally{lock.releaseLock()}
    const storage=DriveApp.getFolderById(prop('ORDERS_FOLDER_ID'));
    const folder=storage.createFolder(id+'_'+String(d.team).replace(/[^\w\- ]/g,'').slice(0,50));
    const files=[];
    for(const file of order.files){
      const group=String(file.group||'Other').replace(/[^a-zA-Z0-9_/-]/g,'').slice(0,60);
      const bytes=Utilities.base64Decode(String(file.base64||''));
      if(bytes.length>3*1024*1024)throw Error('Individual file too large.');
      const blob=Utilities.newBlob(bytes,String(file.mime||'application/octet-stream'),String(file.name||'upload').replace(/[\\/]/g,'_'));
      const created=folder.createFile(blob);files.push({group,name:created.getName(),url:created.getUrl()});
    }
    const summary=JSON.stringify({id,submittedAt:new Date().toISOString(),order:d,files},null,2);
    folder.createFile('Order_Details.json',summary,MimeType.PLAIN_TEXT);
    const doc=DocumentApp.create(id+' - Production Order');
    const body=doc.getBody();body.appendParagraph('TailorBird — Production Order').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('Order ID: '+id);
    body.appendParagraph('Team: '+d.team+' | Customer: '+d.customer+' | Phone: '+d.phone);
    body.appendParagraph('Market: '+(d.market||'')+' | Email: '+(d.email||''));
    body.appendParagraph('Delivery: '+(d.address||'')+' / '+(d.city||'')+'; expected '+(d.date||''));
    body.appendParagraph('Fabric: '+(d.fabricJersey||'')+' | GSM: '+(d.gsmJersey||''));
    body.appendParagraph('Selected designs: '+JSON.stringify(d.selectedCollectionDesigns||[]));
    body.appendParagraph('Player Details').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    for(const p of d.players||[])body.appendParagraph([p.name,p.number,p.product,p.variant,p.size,p.print,'Qty: '+p.qty].join(' | '));
    body.appendParagraph('Quantity totals: '+JSON.stringify(d.counts||{}));
    body.appendParagraph('Logo positions: '+JSON.stringify(d.logoPositions||{}));
    body.appendParagraph('Design notes: '+(d.designNotes||''));
    body.appendParagraph('Printing notes: '+(d.styleNotes||''));
    body.appendParagraph('Production notes: '+(d.notes||''));
    body.appendParagraph('Player list notes: '+(d.playerNotes||''));
    body.appendParagraph('Uploaded files: '+files.map(f=>f.group+': '+f.name+' | '+f.url).join('\n'));
    doc.saveAndClose();
    const srcFile=DriveApp.getFileById(doc.getId());
    const pdf=folder.createFile(srcFile.getAs(MimeType.PDF).setName(id+'_Production_Order.pdf'));
    srcFile.setTrashed(true);
    const sheet=SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Orders');
    sheet.appendRow([new Date(),id,d.team,d.customer,d.phone,d.email||'',d.market||'',d.total||0,d.fabricJersey||'',d.gsmJersey||'',pdf.getUrl(),folder.getUrl(),'Order Received']);
    const recipients=prop('NOTIFICATION_EMAILS')||OWNER_EMAILS.join(',');
    try{MailApp.sendEmail({to:recipients,subject:'New TailorBird Order '+id+' — '+d.team,
      body:'New order received.\nTeam: '+d.team+'\nItems: '+d.total+'\nOrder PDF: '+pdf.getUrl()+'\nAll uploaded files: '+folder.getUrl()});}
    catch(emailErr){console.error('Order saved, but email notification failed: '+emailErr);}
    return htmlReply({ok:true,nonce,orderId:id});
  }catch(err){return htmlReply({ok:false,nonce,message:String(err.message||err)})}
}
function htmlReply(obj){
  const data=JSON.stringify({type:'TAILORBIRD_ORDER_RESULT',...obj}).replace(/</g,'\\u003c');
  // Return confirmation back to the requesting Github Pages iframe.
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>parent.postMessage('+data+',"*")</scr'+'ipt>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
/** RUN ONCE in Apps Script after setting up project. */
function setup(){
  const p=PropertiesService.getScriptProperties();
  if(!p.getProperty('ORDERS_FOLDER_ID'))p.setProperty('ORDERS_FOLDER_ID',DriveApp.createFolder(FOLDER_NAME).getId());
  if(!p.getProperty('SHEET_ID')){
    const sheet=SpreadsheetApp.create(SHEET_NAME);sheet.getActiveSheet().setName('Orders');
    sheet.getSheetByName('Orders').appendRow(['Received At','Order ID','Team','Customer','Phone','Email','Market','Quantity','Fabric','GSM','PDF Link','Drive Folder','Status']);
    p.setProperty('SHEET_ID',sheet.getId());
  }
  p.setProperty('NOTIFICATION_EMAILS',OWNER_EMAILS.join(','));
  Logger.log('Drive Folder: '+DriveApp.getFolderById(p.getProperty('ORDERS_FOLDER_ID')).getUrl());
  Logger.log('Google Sheet: '+SpreadsheetApp.openById(p.getProperty('SHEET_ID')).getUrl());
}
