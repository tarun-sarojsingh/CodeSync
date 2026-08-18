package com.codesync.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    public String executeCode(String language, String code) {
        String workDir = System.getProperty("java.io.tmpdir") + File.separator + "codesync_" + UUID.randomUUID();
        File dir = new File(workDir);
        if (!dir.mkdirs()) {
            return "Error: Could not create secure execution environment.";
        }

        try {
            String fileName;
            String dockerImage;
            String runCommand;

            if ("javascript".equalsIgnoreCase(language) || "typescript".equalsIgnoreCase(language)) {
                fileName = "index.js";
                dockerImage = "node:18-alpine";
                runCommand = "node " + fileName;
            } else if ("python".equalsIgnoreCase(language)) {
                fileName = "main.py";
                dockerImage = "python:3.11-alpine";
                runCommand = "python " + fileName;
            } else {
                return "Error: Language " + language + " is not supported for execution.";
            }

            Path sourceFile = dir.toPath().resolve(fileName);
            Files.writeString(sourceFile, code);

            // Construct secure Docker run command
            // Security considerations:
            // --rm: remove container after exit
            // --network none: no internet access
            // -m 128m: limit memory to 128MB
            // --cpus 0.5: limit CPU usage
            // -v ...: mount the source file read-only
            String[] cmd = {
                    "docker", "run", "--rm",
                    "--network", "none",
                    "-m", "128m",
                    "--cpus", "0.5",
                    "-v", workDir + ":/app:ro",
                    "-w", "/app",
                    dockerImage,
                    "sh", "-c", runCommand
            };

            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return "Error: Execution timed out (Limit 5 seconds).";
            }

            return new String(process.getInputStream().readAllBytes());
        } catch (IOException | InterruptedException e) {
            return "Execution Error: " + e.getMessage();
        } finally {
            // Cleanup
            deleteDirectory(dir);
        }
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directoryToBeDeleted.delete();
    }
}
