import React, { useEffect, useState } from "react";
import { Pencil, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import "./TemplateList.css";
import { useNavigate } from "react-router-dom";

const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_LOCAL_API_URL
    : process.env.REACT_APP_PRODUCTION_API_URL;

const TemplateList = ({ selectedCategory, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch templates from the API
      const response = await fetch(`${apiUrl}/get-all-templates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Ensure the data contains the templates array
      const allTemplates = data.templates || [];

      // Filter templates based on the selected category
      const filteredTemplates = allTemplates.filter((template) => {
        const templateCategory = template.category?.toLowerCase();
        const selectedCategoryLower = selectedCategory?.toLowerCase();
        return templateCategory === selectedCategoryLower;
      });

      // Update the state with filtered templates
      setTemplates(filteredTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setError("Failed to load templates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    console.log("selected template", template);
    const hasParameters = template.template.components.some(
      (comp) => comp.parameters && comp.parameters.length > 0
    );
    if (hasParameters) {
      // navigate(`/template-form/${template.template.name}`, {
      //   state: { template },
      // });
      onTemplateSelect(template);
    } else {
      onTemplateSelect(template);
    }
  };

  const handleDelete = async (templateId, templateName) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const response = await fetch(
          `${apiUrl}/delete-template/${templateId}/${templateName}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchTemplates(); // Refresh the list
      } catch (error) {
        console.error("Error deleting template:", error);
        alert("Failed to delete template. Please try again.");
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="status-icon text-green-500" />;
      case "rejected":
        return <AlertCircle className="status-icon text-red-500" />;
      default:
        return <Clock className="status-icon text-yellow-500" />;
    }
  };

  return (
    <div className="template-container">
      {loading && <p>Loading templates...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && templates.length === 0 && (
        <p>No templates found for the selected category.</p>
      )}
      <div className="template-grid">
        {templates.map((template) => (
          <div
            key={template.template.name}
            className="template-card"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="template-content">
              {template.template.components.map((component, index) => (
                <div key={index} className="template-section">
                  <p className="section-title">{component.type}</p>
                  <p className="section-content">
                    {component.parameters
                      ? component.parameters
                          .map((param) => param.text)
                          .join(", ")
                      : "No parameters"}
                  </p>
                </div>
              ))}
            </div>
            <div className="template-footer">
              <h3 className="template-name">{template.template.name}</h3>
              <div className="template-meta">
                <span className="template-category">{template.category}</span>
                <div className="status">
                  {getStatusIcon(template.status || "pending")}
                </div>
              </div>
              <div className="template-actions">
                <button className="edit-btn">
                  <Pencil className="icon" />
                </button>
                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(template.id, template.template.name)
                  }
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateList;