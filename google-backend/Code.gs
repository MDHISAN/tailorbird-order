/** TailorBird Order Receiver — deploy as a Google Apps Script Web App.
 * Stores each confirmed order in its own team-named folder with categorized subfolders.
 * Do not place credentials or secrets in this public repository.
 */
const OWNER_EMAILS = ['mmh6491@gmail.com', 'tailorbirdbangladesh@gmail.com'];
const FOLDER_NAME = 'TailorBird Customer Orders';
const SHEET_NAME = 'TailorBird Orders';
const TZ = 'Asia/Dhaka';
function prop(key){return PropertiesService.getScriptProperties().getProperty(key)||'';}
function cleanName(s,max){return String(s||'').replace(/[\\/:*?"<>|#%{}~&]/g,' ').replace(/\s+/g,' ').trim().slice(0,max||80)||'Unnamed';}
function ensureFolder(parent,name){const it=parent.getFoldersByName(name);return it.hasNext()?it.next():parent.createFolder(name);}
function groupFolder(group,sub){
  const g=String(group||'Other');
  if(/^Selected Designs/i.test(g))return ensureFolder(sub,'01 - Selected Designs');
  if(/^Logos\\//i.test(g)){
    const root=ensureFolder(sub,'02 - Customer Logos');
    return ensureFolder(root,cleanName(g.split('/').slice(1).join(' - '),60));
  }
  if(/size.?chart|measurement/i.test(g))return ensureFolder(sub,'04 - Size Charts');
  if(/player.?list/i.test(g))return ensureFolder(sub,'05 - Player Lists');
  if(/^Design/i.test(g))return ensureFolder(sub,'03 - Customer Design & Reference Files');
  if(/^Style/i.test(g))return ensureFolder(sub,'06 - Style & Fabric References');
  return ensureFolder(sub,'07 - Other Attachments');
}
function doPost(e){
  let nonce='';
  try{
    const raw=(e&&e.parameter&&e.parameter.payload)||'';
    if(raw.length>12500000)throw Error('Request too large. Please send fewer/smaller attachments.');
    const order=JSON.parse(raw);nonce=String(order.nonce||'');
    const d=order.details||{};
    if(!String(d.team||'').trim()||!String(d.customer||'').trim()||!String(d.phone||'').trim())throw Error('Required customer details are missing.');
    if(!Array.isArray(order.files))throw Error('Invalid attachments.');
    const lock=LockService.getScriptLock();lock.waitLock(30000);
    let id;
    try{
      const stamp=Utilities.formatDate(new Date(),TZ,'yyyyMMdd'),p=PropertiesService.getScriptProperties(),k='NEXT_'+stamp;
      const seq=Number(p.getProperty(k)||'0')+1;p.setProperty(k,String(seq));
      id='TB-'+stamp+'-'+String(seq).padStart(3,'0');
    }finally{lock.releaseLock();}
    const root=DriveApp.getFolderById(prop('ORDERS_FOLDER_ID'));
    const folder=root.createFolder(cleanName(d.team,65)+' — '+id);
    const sub={};
    ['01 - Selected Designs','02 - Customer Logos','03 - Customer Design & Reference Files','04 - Size Charts','05 - Player Lists','06 - Style & Fabric References','07 - Other Attachments','08 - Order Documents'].forEach(n=>sub[n]=ensureFolder(folder,n));
    const saved=[];
    for(const file of order.files){
      const bytes=Utilities.base64Decode(String(file.base64||''));
      if(bytes.length>3*1024*1024)throw Error('Individual file exceeds 3 MB: '+String(file.name||'upload'));
      if(bytes.length===0)throw Error('An uploaded file was empty: '+String(file.name||'upload'));
      let group=String(file.group||'Other');
      if(/player.?list/i.test(group)&&/size|measure|chart/i.test(String(file.name||'')))group='Size Chart';
      const dest=groupFolder(group,sub);
      const name=cleanName(file.name||'upload',150);
      const blob=Utilities.newBlob(bytes,String(file.mime||'application/octet-stream'),name);
      const created=dest.createFile(blob);
      saved.push({group:group,name:created.getName(),url:created.getUrl(),folder:dest.getName(),size:bytes.length});
    }
    const submittedAt=new Date();
    const details={
      orderId:id,submittedAt:Utilities.formatDate(submittedAt,TZ,'yyyy-MM-dd HH:mm:ss'),
      team:d.team,customer:d.customer,phone:d.phone,email:d.email||'',alternatePhone:d.alt||'',
      market:d.market||'',address:d.address||'',city:d.city||'',requestedDelivery:d.date||'',
      fabric:d.fabricJersey||'',gsm:d.gsmJersey||'',quantity:d.total||0,quantityByVariant:d.counts||{},
      selectedDesigns:d.selectedCollectionDesigns||[],designNotes:d.designNotes||'',
      players:d.players||[],playerListNotes:d.playerNotes||'',logoPositions:d.logoPositions||{},
      styleNotes:d.styleNotes||'',productionNotes:d.notes||'',uploadedFiles:saved
    };
    const docs=sub['08 - Order Documents'];
    docs.createFile('Order_Details.json',JSON.stringify(details,null,2),MimeType.PLAIN_TEXT);
    const doc=DocumentApp.create(id+' - '+cleanName(d.team,65)+' - Production Order');
    const body=doc.getBody();
    body.appendParagraph('TAILORBIRD SPORTSWEAR').setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph('CUSTOM ORDER / PRODUCTION BRIEF').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('অর্ডার / Order ID: '+id);
    body.appendParagraph('দল / Team: '+(d.team||'—'));
    body.appendParagraph('কাস্টমার / Customer: '+(d.customer||'—'));
    body.appendParagraph('ফোন / Phone: '+(d.phone||'—')+' | Email: '+(d.email||'—'));
    body.appendParagraph('বাজার / Market: '+(d.market||'—')+' | Alternate phone: '+(d.alt||'—'));
    body.appendParagraph('ঠিকানা / Delivery address: '+[d.address,d.city].filter(Boolean).join(', '));
    body.appendParagraph('প্রত্যাশিত ডেলিভারি / Requested delivery: '+(d.date||'—'));
    body.appendParagraph('পণ্য / Fabric: '+(d.fabricJersey||'—')+' | GSM: '+(d.gsmJersey||'—'));
    body.appendParagraph('মোট পরিমাণ / Total quantity: '+(d.total||0));
    body.appendParagraph('SELECTED CATALOGUE DESIGNS / নির্বাচিত ডিজাইন').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const designs=d.selectedCollectionDesigns||[];
    if(designs.length)designs.forEach((x,i)=>body.appendParagraph((i+1)+'. '+(x.title||'Untitled')+' | ID: '+(x.id||'—')+' | Catalogue page: '+(x.page||'—')));
    else body.appendParagraph('No catalogue design selected / ক্যাটালগ ডিজাইন নির্বাচন করা হয়নি।');
    body.appendParagraph('PLAYER / ITEM LIST').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    if((d.players||[]).length){
      const rows=[['Name','Number','Product','Variant','Size','Print','Qty']];
      (d.players||[]).forEach(p=>rows.push([p.name||'',p.number||'',p.product||'',p.variant||'',p.size||'',p.print||'',String(p.qty||'')]));
      body.appendTable(rows);
    }else body.appendParagraph('No typed player rows; see uploaded player-list files if supplied.');
    body.appendParagraph('LOGO PLACEMENT / লোগোর অবস্থান').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const positions=d.logoPositions||{},keys=Object.keys(positions);
    if(keys.length)keys.forEach(k=>{const p=positions[k]||{};body.appendParagraph(k+' — '+(p.location||'')+' | Content: '+(p.mode||'')+' | Text: '+(p.text||'')+' | Notes: '+(p.notes||'')+' | Files: '+((p.files||[]).join(', ')||'None'));});
    else body.appendParagraph('No logo placement selected / লোগোর অবস্থান নির্দিষ্ট করা হয়নি।');
    body.appendParagraph('FABRIC, DESIGN & PRODUCTION NOTES / নির্দেশনা').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    [['Design notes / ডিজাইন',d.designNotes],['Style & printing / প্রিন্টিং',d.styleNotes],['Player list notes / খেলোয়াড় তালিকা',d.playerNotes],['Production notes / অন্যান্য নির্দেশনা',d.notes]].forEach(x=>{body.appendParagraph(x[0]).setBold(true);body.appendParagraph(String(x[1]||'—'));});
    body.appendParagraph('FILES RECEIVED / পাওয়া ফাইলসমূহ').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    if(saved.length)saved.forEach((x,i)=>body.appendParagraph((i+1)+'. ['+x.folder+'] '+x.name+' — '+x.url));
    else body.appendParagraph('No uploaded attachments.');
    body.appendParagraph('Google Drive order folder: '+folder.getUrl());
    doc.saveAndClose();
    const source=DriveApp.getFileById(doc.getId());
    const pdf=docs.createFile(source.getAs(MimeType.PDF).setName(id+'_Production_Order.pdf'));
    source.setTrashed(true);
    const sheet=SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Orders');
    if(!sheet)throw Error('Orders sheet tab is missing. Run setup() again.');
    sheet.appendRow([submittedAt,id,d.team,d.customer,d.phone,d.email||'',d.market||'',d.total||0,d.fabricJersey||'',d.gsmJersey||'',
      designs.map(x=>(x.title||x.id)+' (page '+(x.page||'?')+')').join('; '),
      keys.join('; '),saved.map(x=>x.folder+': '+x.name).join('\n'),pdf.getUrl(),folder.getUrl(),'Order Received']);
    sheet.getRange(1,1,1,sheet.getLastColumn()).setFontWeight('bold').setWrap(true);
    sheet.setFrozenRows(1);sheet.getDataRange().setVerticalAlignment('top').setWrap(true);
    const recipients=prop('NOTIFICATION_EMAILS')||OWNER_EMAILS.join(',');
    try{MailApp.sendEmail({to:recipients,subject:'New TailorBird Order '+id+' — '+d.team,
      body:'New TailorBird order received.\nOrder ID: '+id+'\nTeam: '+d.team+'\nCustomer: '+d.customer+'\nQuantity: '+(d.total||0)+
      '\nSelected designs: '+designs.map(x=>x.title+' ('+x.id+')').join(', ')+'\nProduction PDF: '+pdf.getUrl()+'\nAll order files: '+folder.getUrl()});}
    catch(emailErr){console.error('Order saved, but email notification failed: '+emailErr);}
    return htmlReply({ok:true,nonce,orderId:id,folderUrl:folder.getUrl(),pdfUrl:pdf.getUrl()});
  }catch(err){console.error(err&&err.stack||err);return htmlReply({ok:false,nonce,message:String(err&&err.message||err)});}
}
function htmlReply(obj){
  const data=JSON.stringify({type:'TAILORBIRD_ORDER_RESULT',...obj}).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>parent.postMessage('+data+',"*")</scr'+'ipt>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
/** Run once to create/reuse the root Drive folder and spreadsheet. */
function setup(){
  const p=PropertiesService.getScriptProperties();
  if(!p.getProperty('ORDERS_FOLDER_ID'))p.setProperty('ORDERS_FOLDER_ID',DriveApp.createFolder(FOLDER_NAME).getId());
  if(!p.getProperty('SHEET_ID')){
    const ss=SpreadsheetApp.create(SHEET_NAME),sheet=ss.getActiveSheet();sheet.setName('Orders');
    sheet.appendRow(['Received At','Order ID','Team','Customer','Phone','Email','Market','Quantity','Fabric','GSM','Selected Designs','Logo Positions','Saved Files (grouped)','Production PDF','Drive Folder','Status']);
    sheet.getRange(1,1,1,sheet.getLastColumn()).setFontWeight('bold').setWrap(true);sheet.setFrozenRows(1);
    p.setProperty('SHEET_ID',ss.getId());
  }else{
    const ss=SpreadsheetApp.openById(p.getProperty('SHEET_ID'));let sheet=ss.getSheetByName('Orders');
    if(!sheet){sheet=ss.insertSheet('Orders');sheet.appendRow(['Received At','Order ID','Team','Customer','Phone','Email','Market','Quantity','Fabric','GSM','Selected Designs','Logo Positions','Saved Files (grouped)','Production PDF','Drive Folder','Status']);}
  }
  // Keep the header row aligned with the current readable order format, including existing sheets.
  const liveSheet=SpreadsheetApp.openById(p.getProperty('SHEET_ID')).getSheetByName('Orders');
  const headers=['Received At','Order ID','Team','Customer','Phone','Email','Market','Quantity','Fabric','GSM','Selected Designs','Logo Positions','Saved Files (grouped)','Production PDF','Drive Folder','Status'];
  liveSheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setWrap(true);
  liveSheet.setFrozenRows(1);
  p.setProperty('NOTIFICATION_EMAILS',OWNER_EMAILS.join(','));
  Logger.log('Drive Folder: '+DriveApp.getFolderById(p.getProperty('ORDERS_FOLDER_ID')).getUrl());
  Logger.log('Google Sheet: '+SpreadsheetApp.openById(p.getProperty('SHEET_ID')).getUrl());
}
