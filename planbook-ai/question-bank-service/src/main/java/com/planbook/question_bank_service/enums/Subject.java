package com.planbook.question_bank_service.enums;

public enum Subject {
    CHEMISTRY_10("Hóa học 10"),
    CHEMISTRY_11("Hóa học 11"),
    CHEMISTRY_12("Hóa học 12");
    
    private final String displayName;
    
    Subject(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}