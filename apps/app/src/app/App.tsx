import { ChangeEvent, FC, useEffect, useState } from 'react';
import { JSONSchema7, JSONSchema7Type } from 'json-schema';
import * as jsYaml from 'yaml';
import { SchemaSwitch } from './components/SchemaSwitch';
import { DarkThemeToggle, FileInput } from 'flowbite-react';

export const App: FC = () => {
  const [workflowSchema, setWorkflowSchema] = useState<JSONSchema7>();
  const [workflowSource, setWorkflowSource] = useState<{
    yaml: string;
    json: JSONSchema7Type;
  }>();

  useEffect(() => {
    fetch('https://json.schemastore.org/github-workflow.json')
      .then((res) => res.json())
      .then(setWorkflowSchema);
  }, []);

  const onFileLoaded = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = ({ target }) => {
        const yaml = (target?.result as string) ?? '';
        const json = jsYaml.parse(yaml) as JSONSchema7Type;
        setWorkflowSource({ yaml: jsYaml.stringify(json), json });
      };
      fileReader.readAsText(file);
    }
  };

  const handleChange = (json: JSONSchema7Type) =>
    setWorkflowSource({ json, yaml: jsYaml.stringify(json) });

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-gray-900 dark:text-white">
      <div
        className="absolute inset-0 [background-position-x:10px] [background-position-y:10px]
                   [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] [background-image:url('assets/bg-light.svg')]
                   dark:[background-image:url('assets/bg-dark.svg')] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.5))]"
      />
      <div className="relative flex items-center justify-between border-b bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="font-mono text-xl">Github Workflow Generator</h1>
        <div className="flex gap-4">
          <FileInput
            className="w-96"
            accept="text/x-yaml"
            onChange={onFileLoaded}
          />
          <DarkThemeToggle />
        </div>
      </div>
      <div className="relative flex flex-grow items-center justify-center overflow-hidden p-2">
        {workflowSchema && workflowSource ? (
          <SchemaSwitch
            json={workflowSource.json}
            schema={workflowSchema}
            definitions={workflowSchema.definitions ?? {}}
            onChange={handleChange}
          />
        ) : (
          <p className="font-mono text-2xl text-gray-500">
            Select a file (example: build.yaml)
          </p>
        )}
      </div>
    </div>
  );
};
