import { useState, useEffect } from 'react';

const DateRangePicker = ({ startDate, endDate, onDateRangeChange, onClear, showPresets = true }) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || '');
  const [localEndDate, setLocalEndDate] = useState(endDate || '');

  useEffect(() => {
    setLocalStartDate(startDate || '');
    setLocalEndDate(endDate || '');
  }, [startDate, endDate]);

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      onDateRangeChange(localStartDate, localEndDate);
    }
  };

  const handleClear = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    if (onClear) {
      onClear();
    }
  };

  const handlePresetClick = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const firstDay = now.getDate() - now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), firstDay);
        end = new Date(now.getFullYear(), now.getMonth(), firstDay + 6);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last7days':
        end = new Date();
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        end = new Date();
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    setLocalStartDate(startDateStr);
    setLocalEndDate(endDateStr);
    onDateRangeChange(startDateStr, endDateStr);
  };

  return (
    <div className="date-range-picker">
      <div className="row g-2 align-items-end">
        <div className="col-auto">
          <label className="form-label mb-1 small">Start Date</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            max={localEndDate || undefined}
          />
        </div>
        <div className="col-auto">
          <label className="form-label mb-1 small">End Date</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            min={localStartDate || undefined}
          />
        </div>
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleApply}
            disabled={!localStartDate || !localEndDate}
          >
            Apply
          </button>
          {(localStartDate || localEndDate) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm ms-1"
              onClick={handleClear}
            >
              Clear
            </button>
          )}
        </div>
        {showPresets && (
          <div className="col-12">
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handlePresetClick('today')}
              >
                Today
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handlePresetClick('week')}
              >
                This Week
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handlePresetClick('month')}
              >
                This Month
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handlePresetClick('last7days')}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handlePresetClick('last30days')}
              >
                Last 30 Days
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;