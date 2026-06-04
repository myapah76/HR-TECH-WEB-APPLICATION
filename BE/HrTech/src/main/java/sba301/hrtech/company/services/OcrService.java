package sba301.hrtech.company.services;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.shared.exceptions.AppException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OcrService {
    //Regrex tax_code
    private static final Pattern TAX_CODE_PATTERN = Pattern.compile("\\b\\d{10,13}\\b");

    public String extractTaxCode(MultipartFile file) {
        String text = performOcr(file);

        if (text == null || text.isBlank()) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "OCR_EXTRACTION_FAILED",
                    "Unable to extract text from the uploaded document. Please upload a clearer image or PDF."
            );
        }

        Matcher matcher = TAX_CODE_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }

        throw new AppException(
                HttpStatus.BAD_REQUEST,
                "TAX_CODE_NOT_FOUND",
                "No valid tax code (10-13 digits) found in the uploaded document. Please upload the correct business license."
        );
    }

    private String performOcr(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "temp.png";
        }
        
        File tempFile = null;
        try {
            tempFile = File.createTempFile("ocr-", originalFilename);
            java.nio.file.Files.copy(file.getInputStream(), tempFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            Tesseract tesseract = new Tesseract();
            // Automatically extract tessdata from classpath resources to a safe system temp folder
            File tessDataFolder = net.sourceforge.tess4j.util.LoadLibs.extractTessResources("tessdata");
            tesseract.setDatapath(tessDataFolder.getAbsolutePath());
            tesseract.setLanguage("vie+eng");

            String text = "";
            if (originalFilename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = Loader.loadPDF(tempFile)) {
                    PDFRenderer pdfRenderer = new PDFRenderer(document);
                    StringBuilder sb = new StringBuilder();
                    for (int page = 0; page < document.getNumberOfPages(); page++) {
                        BufferedImage bim = pdfRenderer.renderImageWithDPI(page, 300);
                        File tempImg = File.createTempFile("ocr-pdf-page-", ".png");
                        try {
                            ImageIO.write(bim, "png", tempImg);
                            sb.append(tesseract.doOCR(tempImg)).append("\n");
                        } finally {
                            Files.deleteIfExists(tempImg.toPath());
                        }
                    }
                    text = sb.toString();
                }
            } else {
                text = tesseract.doOCR(tempFile);
            }
            return text;
        } catch (IOException | TesseractException e) {
            throw new AppException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "OCR_PROCESSING_ERROR",
                    "Failed to process document for OCR: " + e.getMessage()
            );
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile.toPath());
                } catch (IOException ignored) {}
            }
        }
    }
}
