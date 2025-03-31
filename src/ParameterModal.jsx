import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from "@mui/material";

const ParameterModal = ({ 
  open, 
  onClose, 
  template, 
  onSendWithParameters 
}) => {
  const [parameterValues, setParameterValues] = useState({});
  const [componentParameters, setComponentParameters] = useState([]);

  // Extract all parameters from components and organize them
  useEffect(() => {
    if (template?.template?.components) {
      const params = [];
      const initialValues = {};
      
      template.template.components.forEach(component => {
        if (component.type === 'FOOTER') return;
        
        if (component.parameters) {
          component.parameters.forEach(param => {
            if (param.text) {
              // Extract all parameter placeholders (like {{1}}, {{2}})
              const matches = param.text.match(/\{\{(\d+)\}\}/g) || [];
              matches.forEach(match => {
                const index = match.replace(/\D/g, '');
                const paramKey = `${component.type}_${index}`;
                
                // Only add if not already present
                if (!params.some(p => p.key === paramKey)) {
                  params.push({
                    componentType: component.type,
                    index,
                    key: paramKey,
                    placeholder: match,
                    fullText: param.text
                  });
                  
                  initialValues[paramKey] = '';
                }
              });
            }
          });
        }
      });
      
      setComponentParameters(params);
      setParameterValues(initialValues);
    }
  }, [template]);

  if (!template || !template.template || !template.template.components) {
    return null;
  }

  const handleParameterChange = (key, value) => {
    setParameterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    const processedComponents = template.template.components.map(component => {
      if (component.type === 'FOOTER') {
        return component;
      }

      if (!component.parameters) return component;
      
      const parameters = component.parameters.map(param => {
        if (!param.text) return param;
        
        // Replace all parameters in the text
        let newText = param.text;
        componentParameters
          .filter(p => p.componentType === component.type)
          .forEach(({ placeholder, key }) => {
            const value = parameterValues[key] || '';
            newText = newText.replace(new RegExp(placeholder, 'g'), value);
          });
        
        return {
          ...param,
          text: newText
        };
      });
      
      return {
        ...component,
        parameters
      };
    });

    onSendWithParameters({
      ...template,
      template: {
        ...template.template,
        components: processedComponents
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Enter Template Parameters</DialogTitle>
      <DialogContent dividers>
        {componentParameters.map((param) => (
          <Box key={param.key} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label={`${param.componentType} Parameter ${param.placeholder}`}
              variant="outlined"
              value={parameterValues[param.key] || ''}
              onChange={(e) => handleParameterChange(param.key, e.target.value)}
              helperText={`Will replace ${param.placeholder} in the template`}
              sx={{ mb: 2 }}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
        >
          Send Message
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParameterModal;