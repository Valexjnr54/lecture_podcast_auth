async function isDocumentFile(mimetype) {
  // Define mimetypes for document files
  const documentMimetypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  // Check if the mimetype of the uploaded file represents a document file type
  return documentMimetypes.includes(mimetype);
}

module.exports = {
  isDocumentFile
};
