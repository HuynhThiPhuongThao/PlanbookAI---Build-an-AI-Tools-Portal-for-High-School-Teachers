package com.planbook.dto;

public class PromptDTO {

    // Request khi tạo prompt
    public static class PromptCreate {
        private String name;
        private String type;
        private String content;

        // getters & setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    // Response khi nhận prompt từ AI service
    public static class PromptResponse {
        private Long id;
        private String name;
        private String type;
        private String content;
        private Integer version;
        private Boolean isActive;
        private String createdBy;

        // getters & setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Integer getVersion() { return version; }
        public void setVersion(Integer version) { this.version = version; }

        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }

        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    }
}
