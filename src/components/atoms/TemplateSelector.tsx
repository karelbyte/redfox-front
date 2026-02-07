'use client';

import { useState, useEffect } from 'react';
import { templatesService, Template } from '@/services/templates.service';
import { toastService } from '@/services/toast.service';
import { Btn, Select } from '@/components/atoms';

interface TemplateSelectorProps {
  entityType: string;
  onSelectTemplate?: (template: Template) => void;
  onSaveAsTemplate?: (name: string, data: Record<string, any>) => void;
  className?: string;
}

export default function TemplateSelector({
  entityType,
  onSelectTemplate,
  onSaveAsTemplate,
  className = '',
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [entityType]);

  const loadTemplates = async () => {
    try {
      const data = await templatesService.findByUser(entityType);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    if (!templateId) return;

    try {
      const template = await templatesService.findById(templateId);
      onSelectTemplate?.(template);
      toastService.success('Template loaded');
    } catch (error) {
      console.error('Error loading template:', error);
      toastService.error('Error loading template');
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;

    setIsLoading(true);
    try {
      onSaveAsTemplate?.(templateName, {});
      setTemplateName('');
      setShowSaveForm(false);
      await loadTemplates();
      toastService.success('Template saved');
    } catch (error) {
      console.error('Error saving template:', error);
      toastService.error('Error saving template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <select
          value={selectedTemplateId}
          onChange={(e) => {
            setSelectedTemplateId(e.target.value);
            handleSelectTemplate(e.target.value);
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Load template...</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
              {template.isDefault ? ' (default)' : ''}
            </option>
          ))}
        </select>
        <Btn
          variant="secondary"
          onClick={() => setShowSaveForm(!showSaveForm)}
        >
          Save as Template
        </Btn>
      </div>

      {showSaveForm && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <input
            type="text"
            placeholder="Template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <Btn
              size="sm"
              onClick={handleSaveTemplate}
              disabled={isLoading || !templateName.trim()}
            >
              Save
            </Btn>
            <Btn
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowSaveForm(false);
                setTemplateName('');
              }}
            >
              Cancel
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
