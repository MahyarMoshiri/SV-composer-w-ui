import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, Check, Activity } from 'lucide-react';

const HARNESS_OPTIONS = ['echo', 'openai', 'custom'];

const deriveHarnessOption = (value) => {
  if (!value) return 'echo';
  if (HARNESS_OPTIONS.includes(value)) return value;
  const lowered = value.toLowerCase();
  return HARNESS_OPTIONS.includes(lowered) ? lowered : 'custom';
};

const isPresetHarness = (value) => HARNESS_OPTIONS.includes(value);

const TopBar = () => {
  const { bankset, updateBankset, availableBanks, harness, updateHarness, health } = useApp();
  const [selectedBanks, setSelectedBanks] = useState(bankset);
  const [isOpen, setIsOpen] = useState(false);
  const [isHarnessOpen, setIsHarnessOpen] = useState(false);

  const [selectedHarnessOption, setSelectedHarnessOption] = useState(deriveHarnessOption(harness));
  const [pendingCustomHarness, setPendingCustomHarness] = useState(
    isPresetHarness(harness) ? '' : harness
  );
  const [harnessError, setHarnessError] = useState('');

  useEffect(() => {
    setSelectedBanks(bankset);
  }, [bankset]);

  useEffect(() => {
    setSelectedHarnessOption(deriveHarnessOption(harness));
    setPendingCustomHarness(isPresetHarness(harness) ? '' : harness);
  }, [harness]);

  const handleBankToggle = (bankId) => {
    setSelectedBanks((prev) =>
      prev.includes(bankId)
        ? prev.filter((id) => id !== bankId)
        : [...prev, bankId]
    );
  };

  const handleApply = () => {
    updateBankset(selectedBanks.length > 0 ? selectedBanks : ['default']);
    setIsOpen(false);
  };

  const handleHarnessApply = () => {
    let finalValue = selectedHarnessOption;
    if (selectedHarnessOption === 'custom') {
      const trimmed = pendingCustomHarness.trim();
      if (!trimmed) {
        setHarnessError('Enter a harness identifier');
        return;
      }
      finalValue = trimmed;
    }

    updateHarness(finalValue);
    setIsHarnessOpen(false);
    setHarnessError('');
  };

  const getHealthColor = () => {
    switch (health.status) {
      case 'ok':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">SV Composer</h1>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span className="text-sm">
                Bankset: {bankset.join(', ') || 'default'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Select Banks</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose one or more banks for schemas, metaphors, frames, and gold labels
                </p>
              </div>
              
              <div className="space-y-2">
                {availableBanks.map((bank) => (
                  <div
                    key={bank.bank_id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleBankToggle(bank.bank_id)}
                  >
                    <div className="w-4 h-4 border rounded flex items-center justify-center">
                      {selectedBanks.includes(bank.bank_id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{bank.bank_id}</div>
                      <div className="text-xs text-muted-foreground">
                        v{bank.version}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <Button onClick={handleApply} className="w-full">
                  Apply
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Sets X-SV-Banks header for all API requests
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-4">
        <Popover open={isHarnessOpen} onOpenChange={(open) => {
          setIsHarnessOpen(open);
          if (open) {
            setHarnessError('');
          }
        }}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span className="text-xs">Harness:</span>
              <span className="font-mono text-xs">{harness}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Select Harness</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an available harness or enter a custom identifier. Requests default to this harness unless overridden.
                </p>
              </div>

              <div className="space-y-2">
                {HARNESS_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    variant={selectedHarnessOption === option ? 'default' : 'outline'}
                    className="w-full justify-between text-sm capitalize"
                    onClick={() => {
                      setSelectedHarnessOption(option);
                      if (option !== 'custom') {
                        setPendingCustomHarness('');
                        setHarnessError('');
                      }
                    }}
                  >
                    {option === 'custom' ? 'Custom' : option}
                    {selectedHarnessOption === option && <Check className="h-3 w-3" />}
                  </Button>
                ))}
              </div>

              {selectedHarnessOption === 'custom' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Custom harness identifier</label>
                  <Input
                    value={pendingCustomHarness}
                    onChange={(event) => {
                      setPendingCustomHarness(event.target.value);
                      if (event.target.value.trim()) {
                        setHarnessError('');
                      }
                    }}
                    placeholder="e.g., gpt-4o-mini"
                  />
                  {harnessError && (
                    <p className="text-xs text-destructive">{harnessError}</p>
                  )}
                </div>
              )}

              <div className="pt-3 border-t">
                <Button onClick={handleHarnessApply} className="w-full">
                  Apply
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Updates default `llm` for generation requests
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Badge variant="outline" className="gap-2">
          <Activity className="h-3 w-3" />
          <span className="text-xs">Status:</span>
          <div className={`w-2 h-2 rounded-full ${getHealthColor()}`} />
        </Badge>
      </div>
    </div>
  );
};

export default TopBar;
