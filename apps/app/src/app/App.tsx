import { ChangeEvent, FC, useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { JSONSchema7, JSONSchema7Type } from 'json-schema';
import * as jsYaml from 'yaml';
import { SchemaSwitch } from './components/SchemaSwitch';
import { DarkThemeToggle, FileInput } from 'flowbite-react';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const App: FC = () => {
  const [workflowSchema, setWorkflowSchema] = useState<JSONSchema7>();
  const [workflowSource, setWorkflowSource] = useState<{
    yaml: string;
    json: JSONSchema7Type;
  }>();

  const onFileLoaded = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = ({ target }) => {
        const yaml = (target?.result as string) ?? '';
        const json = jsYaml.parse(yaml) as JSONSchema7Type;
        setWorkflowSource({ yaml, json });
      };
      fileReader.readAsBinaryString(file);
    }
  };

  useEffect(() => {
    fetch('https://json.schemastore.org/github-workflow.json')
      .then((res) => res.json())
      .then(setWorkflowSchema);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 p-2 dark:bg-gray-900 dark:text-white">
      <div className="m-2 flex items-center justify-between rounded-lg bg-white py-2 px-4 shadow-md dark:bg-gray-800">
        Github Workflow Generator
        <DarkThemeToggle />
      </div>
      <div className="flex flex-grow overflow-hidden">
        <div className="m-2 w-full flex-grow overflow-hidden rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="h-full overflow-auto p-1">
            {workflowSchema && workflowSource && (
              <SchemaSwitch
                json={workflowSource.json}
                schema={workflowSchema}
                definitions={workflowSchema.definitions ?? {}}
              />
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 overflow-hidden p-2">
          <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
            <FileInput accept="text/x-yaml" onChange={onFileLoaded} />
          </div>
          <div className="flex-grow overflow-hidden rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
            {workflowSource && (
              <SyntaxHighlighter
                className="h-full overflow-auto border dark:border-gray-700"
                language="yaml"
                style={darcula}
              >
                {workflowSource.yaml}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
