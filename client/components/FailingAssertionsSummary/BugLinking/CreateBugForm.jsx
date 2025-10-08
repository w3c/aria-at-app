import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../common/FormField';

/**
 * Form for creating a new AT bug
 */
const CreateBugForm = React.memo(
  ({ onCreateBug, onCancel, creating, error, checkDuplicateUrl }) => {
    const [formData, setFormData] = useState({
      title: '',
      bugId: '',
      url: ''
    });

    const duplicateUrl = useMemo(
      () => checkDuplicateUrl?.(formData.url),
      [checkDuplicateUrl, formData.url]
    );

    const hasDuplicate = !!duplicateUrl;

    const handleSubmit = async e => {
      e.preventDefault();
      if (hasDuplicate) return;

      const created = await onCreateBug(formData);
      if (created) {
        // Reset form (parent will handle mode switching)
        setFormData({ title: '', bugId: '', url: '' });
      }
    };

    const handleChange = e => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">Add New Bug Link</legend>

          <FormField
            id="new-bug-title"
            name="title"
            label="Link Text"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <FormField
            id="new-bug-id"
            name="bugId"
            label="ID"
            type="number"
            value={formData.bugId}
            onChange={handleChange}
            required
          />

          <FormField
            id="new-bug-url"
            name="url"
            label="URL"
            type="url"
            value={formData.url}
            onChange={handleChange}
            required
            error={
              duplicateUrl
                ? `This URL already exists as Bug #${duplicateUrl.bugId}: ${duplicateUrl.title}`
                : null
            }
          />

          <button
            type="submit"
            className="btn btn-outline-secondary btn-sm"
            disabled={creating || hasDuplicate}
          >
            {creating ? 'Adding…' : 'Add'}
          </button>
          <button
            type="button"
            className="btn btn-link btn-sm ms-2"
            onClick={onCancel}
          >
            Back to list
          </button>
          {error && (
            <div className="text-danger mt-2" role="alert">
              {error.message}
            </div>
          )}
        </fieldset>
      </form>
    );
  }
);

CreateBugForm.propTypes = {
  onCreateBug: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  creating: PropTypes.bool,
  error: PropTypes.object,
  checkDuplicateUrl: PropTypes.func
};

export default CreateBugForm;
