import { render, screen } from '@testing-library/react'
import FileUploadManager from '@/components/FileUploadManager'

describe('FileUploadManager smoke', () => {
  it('renders file management interface', async () => {
    render(
      <FileUploadManager 
        language="en" 
        projectId="test-project"
        onFileUploaded={() => {}}
        onFileAnalyzed={() => {}}
      />
    )

    // Should render main sections
    expect(await screen.findByText(/File Management/i)).toBeInTheDocument()
    expect(screen.getByText(/File Library/i)).toBeInTheDocument()
    
    // Should show supported formats
    expect(screen.getByText(/Supported formats/i)).toBeInTheDocument()
    
    // Should have file input
    expect(screen.getByLabelText(/Select Files/i)).toBeInTheDocument()
  })

  it('renders with Russian language', async () => {
    render(
      <FileUploadManager 
        language="ru" 
        projectId="test-project"
        onFileUploaded={() => {}}
        onFileAnalyzed={() => {}}
      />
    )

    // Should render in Russian
    expect(await screen.findByText(/Управление Файлами/i)).toBeInTheDocument()
    expect(screen.getByText(/Библиотека Файлов/i)).toBeInTheDocument()
    expect(screen.getByText(/Поддерживаемые форматы/i)).toBeInTheDocument()
  })
})