/* eslint-disable react/jsx-props-no-spreading */
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type ImageUploadProps = {
  files?: File[] | File | string[] | string | null;
  setFiles: (file: File[]) => void;
};

const ImageUpload = ({ setFiles, files }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const clear = () => setFiles([]);

  return (
    <>
      <div {...getRootProps()} className="image-upload">
        <input {...getInputProps()} />
        {
          isDragActive
            ? <p>Drop the files here...</p>
            : <p>Click to select .jpeg files or drag them here.</p>
        }
        {
          files && Array.isArray(files) && files.map((f) => (
            <p key={f.name}>{f.name || f}</p>
          ))
        }
        {
          files && !Array.isArray(files) && (
            <p>{(files as File).name || files}</p>
          )
        }
      </div>
      <button type="button" onClick={clear} className="clear">clear</button>
    </>
  );
};

ImageUpload.defaultProps = {
  files: null,
};

export default ImageUpload;
