package com.class_manager.backend.exceptions;

public class AppPropertiesConfigException extends RuntimeException {

    public AppPropertiesConfigException(String message) {
        super(message);
    }

    public AppPropertiesConfigException(Throwable throwable) {
        super("Failed to load the app_settings.json file. Please check the file format and content: ", throwable);
    }
    
}
