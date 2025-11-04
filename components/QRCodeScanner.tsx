import React, { useEffect, useRef } from 'react';
import { ArrowLeftIcon } from './icons';

declare global {
    interface Window {
        Html5Qrcode: any;
    }
}

interface QRCodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
        };

        // Use a flag to prevent multiple executions of the success callback
        let hasScanned = false;

        const successCallback = (decodedText: string, decodedResult: any) => {
            if (hasScanned) return;
            hasScanned = true;
            
            if (scannerRef.current) {
                scannerRef.current.stop()
                    .then(() => {
                        onScanSuccess(decodedText);
                    })
                    .catch((err: any) => {
                        console.error("Failed to stop scanner after success:", err);
                        // Still call success handler even if stop fails
                        onScanSuccess(decodedText);
                    });
            }
        };

        const errorCallback = (errorMessage: string) => {
            // This callback is called frequently, so it's best to keep it empty or log sparingly.
        };
        
        const readerElement = document.getElementById("reader");
        if (readerElement) {
            const scannerInstance = new window.Html5Qrcode("reader");
            scannerRef.current = scannerInstance;

            scannerInstance.start({ facingMode: "environment" }, config, successCallback, errorCallback)
                .catch((err: any) => {
                    console.error("Unable to start scanning.", err);
                    alert('Não foi possível iniciar a câmara. Verifique as permissões da câmara no seu navegador e tente novamente.');
                    onClose();
                });
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch((err: any) => {
                    // This error is common if the scanner is already stopped, so we can ignore it.
                });
            }
        };
    }, [onScanSuccess, onClose]);

    return (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold">Ler QR Code da Fatura</h2>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                     <ArrowLeftIcon className="w-6 h-6" />
                     <span className="sr-only">Voltar</span>
                 </button>
            </div>
            <div id="reader" className="w-full flex-grow rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"></div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Aponte a câmara para o código QR da sua fatura.
            </p>
        </div>
    );
};

export default QRCodeScanner;
