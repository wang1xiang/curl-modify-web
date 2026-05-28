import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'

export function GeminiSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[] }) {
  const selected = options.find((o) => o.value === value) || options[0]

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full">
        <Listbox.Button className="w-full flex items-center justify-between input-gemini !py-2.5 !text-xs !px-4 hover:border-primary-500/50">
          <span className="truncate pr-4">{selected.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-[100] w-full mt-2 py-1 bg-white dark:bg-slate-900 border border-border-light dark:border-white/10 rounded-2xl shadow-2xl overflow-auto custom-scrollbar focus:outline-none min-w-[180px]">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-4 pr-10 text-sm font-medium ${
                    active ? 'bg-primary-500/10 text-primary-400' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                      {option.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-500">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
