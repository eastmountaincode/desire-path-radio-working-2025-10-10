interface UploadProgressProps {
  isSubmitting: boolean
  success: boolean
  uploadSteps: {
    audio: 'pending' | 'uploading' | 'completed' | 'error' | 'skipped'
    image: 'pending' | 'uploading' | 'completed' | 'error' | 'skipped'
    database: 'pending' | 'processing' | 'completed' | 'error'
  }
}

export default function UploadProgress({ isSubmitting, success, uploadSteps }: UploadProgressProps) {
  if (!isSubmitting && !success) return null

  return (
    <div className="space-y-3 pt-4">
      <h3 className="text-sm font-medium text-grey6">Upload Progress</h3>

      {/* Audio Upload Step */}
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
          uploadSteps.audio === 'completed' ? 'bg-brand-dpr-green text-grey1' :
          uploadSteps.audio === 'uploading' ? 'bg-brand-dpr-orange text-grey1' :
          uploadSteps.audio === 'error' ? 'bg-brand-dpr-orange text-grey1' :
          uploadSteps.audio === 'skipped' ? 'bg-grey3 text-grey5' :
          'bg-grey3 text-grey5'
        }`}>
          {uploadSteps.audio === 'completed' ? '✓' :
           uploadSteps.audio === 'uploading' ? '⟳' :
           uploadSteps.audio === 'error' ? '✗' :
           uploadSteps.audio === 'skipped' ? '—' : '○'}
        </div>
        <span className={`text-sm ${
          uploadSteps.audio === 'completed' ? 'text-brand-dpr-green' :
          uploadSteps.audio === 'error' ? 'text-brand-dpr-orange' :
          uploadSteps.audio === 'uploading' ? 'text-brand-dpr-orange' :
          'text-grey5'
        }`}>
          {uploadSteps.audio === 'uploading' ? 'Uploading audio file...' :
           uploadSteps.audio === 'completed' ? 'Audio uploaded successfully' :
           uploadSteps.audio === 'error' ? 'Audio upload failed' :
           uploadSteps.audio === 'skipped' ? 'No audio file' : 'Audio upload'}
        </span>
      </div>

      {/* Image Upload Step */}
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
          uploadSteps.image === 'completed' ? 'bg-brand-dpr-green text-grey1' :
          uploadSteps.image === 'uploading' ? 'bg-brand-dpr-orange text-grey1' :
          uploadSteps.image === 'error' ? 'bg-brand-dpr-orange text-grey1' :
          uploadSteps.image === 'skipped' ? 'bg-grey3 text-grey5' :
          'bg-grey3 text-grey5'
        }`}>
          {uploadSteps.image === 'completed' ? '✓' :
           uploadSteps.image === 'uploading' ? '⟳' :
           uploadSteps.image === 'error' ? '✗' :
           uploadSteps.image === 'skipped' ? '—' : '○'}
        </div>
        <span className={`text-sm ${
          uploadSteps.image === 'completed' ? 'text-brand-dpr-green' :
          uploadSteps.image === 'error' ? 'text-brand-dpr-orange' :
          uploadSteps.image === 'uploading' ? 'text-brand-dpr-orange' :
          'text-grey5'
        }`}>
          {uploadSteps.image === 'uploading' ? 'Uploading image file...' :
           uploadSteps.image === 'completed' ? 'Image uploaded successfully' :
           uploadSteps.image === 'error' ? 'Image upload failed' :
           uploadSteps.image === 'skipped' ? 'No image file' : 'Image upload'}
        </span>
      </div>

      {/* Database Step */}
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
          uploadSteps.database === 'completed' ? 'bg-brand-dpr-green text-grey1' :
          uploadSteps.database === 'processing' ? 'bg-brand-dpr-orange text-grey1' :
          uploadSteps.database === 'error' ? 'bg-brand-dpr-orange text-grey1' :
          'bg-grey3 text-grey5'
        }`}>
          {uploadSteps.database === 'completed' ? '✓' :
           uploadSteps.database === 'processing' ? '⟳' :
           uploadSteps.database === 'error' ? '✗' : '○'}
        </div>
        <span className={`text-sm ${
          uploadSteps.database === 'completed' ? 'text-brand-dpr-green' :
          uploadSteps.database === 'error' ? 'text-brand-dpr-orange' :
          uploadSteps.database === 'processing' ? 'text-brand-dpr-orange' :
          'text-grey5'
        }`}>
          {uploadSteps.database === 'processing' ? 'Creating database entry...' :
           uploadSteps.database === 'completed' ? 'Database entry created successfully' :
           uploadSteps.database === 'error' ? 'Database entry creation failed' : 'Database entry creation'}
        </span>
      </div>
    </div>
  )
}
