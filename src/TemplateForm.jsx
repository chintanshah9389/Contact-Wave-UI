import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import "./TemplateForm.css";

export default function TemplateForm({ isEditing }) {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "UTILITY",
    language: "en_US",
    components: [
      { type: "HEADER", format: "TEXT", text: "" },
      { type: "BODY", text: "" },
      { type: "FOOTER", text: "" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && templateId) {
      fetchTemplateDetails();
    }
  }, [isEditing, templateId]);

  const fetchTemplateDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/get-template-status/${templateId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFormData(data);
    } catch (error) {
      console.error("Error fetching template details:", error);
      setError("Failed to load template details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/edit-template/${templateId}/${formData.name}`
        : "/create-template";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      navigate("/send-message");
    } catch (error) {
      console.error("Error saving template:", error);
      setError("Failed to save template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setFormData({ ...formData, components: newComponents });
  };

  const addParameter = (componentIndex) => {
    const component = formData.components[componentIndex];
    const parameterCount = (component.text.match(/{{[0-9]+}}/g) || []).length;
    const newParameter = `{{${parameterCount + 1}}}`;
    const newText = component.text + " " + newParameter;
    handleComponentChange(componentIndex, "text", newText);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-section">
        <h2 className="form-title">{isEditing ? "Edit Template" : "Create Template"}</h2>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input"
            >
              <option value="UTILITY">Utility</option>
              <option value="MARKETING">Marketing</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="form-input"
            >
              <option value="en_US">English (US)</option>
              <option value="es">Spanish</option>
              <option value="pt_BR">Portuguese (Brazil)</option>
            </select>
          </div>

          {formData.components.map((component, index) => (
            <div key={index} className="component-section">
              <div className="component-header">
                <h3 className="component-title">{component.type}</h3>
                <button
                  type="button"
                  onClick={() => addParameter(index)}
                  className="add-parameter-button"
                >
                  <Plus className="icon" />
                </button>
              </div>

              {component.type === "HEADER" && (
                <select
                  value={component.format}
                  onChange={(e) => handleComponentChange(index, "format", e.target.value)}
                  className="form-input"
                >
                  <option value="TEXT">Text</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              )}

              <textarea
                value={component.text}
                onChange={(e) => handleComponentChange(index, "text", e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder={`Enter ${component.type.toLowerCase()} text...`}
              />
            </div>
          ))}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/send-message")}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? "Saving..." : isEditing ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </div>

      <div className="preview-section">
        <h3 className="preview-title">Template Preview</h3>
        <div className="preview-content">
          <h4 className="preview-template-name">{formData.name}</h4>
          {formData.components.map((component, index) => (
            <div key={index} className="preview-component">
              <h5 className="preview-component-title">{component.type}</h5>
              <p className="preview-component-text">{component.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};