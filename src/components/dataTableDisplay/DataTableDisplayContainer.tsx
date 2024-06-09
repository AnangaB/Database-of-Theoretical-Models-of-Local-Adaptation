import { useState, useEffect } from "react";
import { SearchParamProps } from "../../types/SearchParamProps";
import DataTableDisplay from "./DataTableDisplay";
import ExcelJS from "exceljs";
import IndividualPage from "./IndividualPage";
import WeakMatchesDisplay from "./WeakMatchesDisplay";
interface DataTableDisplayContainerProps {
  SearchParams: SearchParamProps;
}
//describes whether or not to display an individual page,, and which individual page to display
interface IndividualPageDisplayMode {
  display: boolean;
  currentRow: Record<string, string>;
}

const DataTableDisplayContainer: React.FC<DataTableDisplayContainerProps> = ({
  SearchParams,
}) => {
  //state to store worksheet containing the entire local adaptation data set
  const [originalDataTableWorksheet, setoriginalDataTableWorksheet] =
    useState<ExcelJS.Worksheet | null>(null);

  //parse the data excel sheet
  useEffect(() => {
    const loadWorkbook = async () => {
      try {
        // Fetch the Excel file
        const response = await fetch("/LocalAdaptationApp/data.xlsx");
        //const response = await fetch("LocalAdaptationApp/public/data.xlsx");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Convert the response to a Blob
        const blob = await response.blob();

        // Create a FileReader to read the Blob
        const arrayBuffer = await blob.arrayBuffer();

        // Load the ArrayBuffer into ExcelJS Workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        setoriginalDataTableWorksheet(workbook.worksheets[0]);
      } catch (error) {
        console.error("Error reading Excel file:", error);
      }
    };

    loadWorkbook();
  }, []);

  //stores the entire exported data table as a list, with each row being an record element in list
  const [allRowsList, setAllRowsList] = useState<Record<string, any>[]>([]);

  // stores only the row element from allRowsList that is to be displayed
  const [fullyMatchingRowsList, setFullyMatchingRowsList] = useState<
    Record<string, string>[]
  >([]);
  //store headers for data table
  //const [dataTableHeaders, setDataTableHeaders] = useState<{ field: string }[]>(
  //[]
  //);

  useEffect(() => {
    if (originalDataTableWorksheet) {
      let rows: Record<string, any>[] = [];
      let header: string[] = [];
      let index: number = 0;

      originalDataTableWorksheet.eachRow((row, rowNumber) => {
        if (rowNumber == 1) {
          header = row.values as string[];
          //fix how there is no title for first column
          //header.shift();
          header[0] = "Index";

          //const newColDefs = header.map((field) => ({ field }));
          //setDataTableHeaders(newColDefs);
        } else {
          let newEntry: Record<string, any> = {};
          newEntry["Index"] = index;
          index++;
          for (let i = 1; i < header.length; i++) {
            newEntry[header[i]] = row.getCell(i).value;
          }
          rows.push(newEntry);
        }
      });
      setAllRowsList(rows);
      setFullyMatchingRowsList(rows);
    }
  }, [originalDataTableWorksheet]);

  const [rowSimilarityScores, setRowSimilarityScore] = useState<
    Record<number, number>
  >({});

  //update fullyMatchingRowsList with the search param values
  useEffect(() => {
    if (allRowsList != null && allRowsList.length > 0) {
      let similarScoresRecord: Record<number, number> = {};
      let rows: Record<string, any>[] = [];
      for (let i = 0; i < allRowsList.length; i++) {
        let { isMatch, similarScore } = checkIfRowIsValid(allRowsList[i]);

        similarScoresRecord[i] = similarScore;

        if (isMatch) {
          rows.push(allRowsList[i]);
        }
      }

      setRowSimilarityScore(similarScoresRecord);
      setFullyMatchingRowsList(rows);
    }
  }, [SearchParams]);

  //check if a row satisfies the input of SearchParams fully, and also returns a score of how many true matches it contained
  const checkIfRowIsValid: (row: Record<string, any>) => {
    isMatch: boolean;
    similarScore: number;
  } = (row: Record<string, any>) => {
    let similarScore = 0;

    let isFullyMatching: boolean = true;
    if (!individualPageDisplayMode["display"]) {
      for (const key of Object.keys(SearchParams)) {
        const searchValue = SearchParams[key as keyof SearchParamProps];
        const rowValue = row[key]?.toString().toLowerCase() || "";

        let isMatch = searchValue.test(rowValue);
        if (isMatch) {
          similarScore += 1;
          //"Index","Paper Name","Authors","Year","Journal","Title","Abstract","Open Access", "Reviewer 1","Reviewer 2"
        } else {
          isFullyMatching = false;
        }
      }
    }
    return { isMatch: isFullyMatching, similarScore: similarScore };
  };

  //state to describe whether to display details about an individual paper and which paper (currentRow con)
  const [individualPageDisplayMode, setIndividualPageDisplayMode] =
    useState<IndividualPageDisplayMode>({
      display: false,
      currentRow: {},
    });

  const pageTitleOnclick = (row: Record<string, string>) => {
    if (row) {
      setIndividualPageDisplayMode({
        display: true,
        currentRow: row,
      });
    }
  };

  return (
    <div className="m-0 container-fluid">
      {individualPageDisplayMode["display"] == true ? (
        <>
          <IndividualPage
            row={individualPageDisplayMode["currentRow"]}
            backButtonOnClick={() => {
              setIndividualPageDisplayMode({
                display: false,
                currentRow: {},
              });
            }}
          />
        </>
      ) : (
        <div className="pt-4">
          <p className="h3 text-center">
            Papers fully matching all search parameters:
          </p>

          <DataTableDisplay
            dataDisplayList={fullyMatchingRowsList}
            pageTitleOnclick={pageTitleOnclick}
          />
          <WeakMatchesDisplay
            allRowsList={allRowsList}
            similaritiesScores={rowSimilarityScores}
            pageTitleOnclick={pageTitleOnclick}
          />
        </div>
      )}
    </div>
  );
};

export default DataTableDisplayContainer;
