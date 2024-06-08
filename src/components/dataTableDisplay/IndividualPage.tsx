import { SearchParamProps } from "../../types/SearchParamProps";

//
//import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
//import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
//import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

interface IndividualPageProps {
  row: Record<string, string>;
  backButtonOnClick: () => void;
}

const IndividualPage: React.FC<IndividualPageProps> = ({
  row,
  backButtonOnClick,
}) => {
  return (
    <div>
      {row && (
        <div className="container-fluid" key="IndividualPageContainerDiv">
          <div className="row py-4">
            <div className="col-sm-9 col-md-10 col-12">
              <div className="h4">{row["Title"]}</div>
            </div>
            <div className="col-sm-3 col-md-2 col-12">
              <p className="btn btn-primary" onClick={backButtonOnClick}>
                Go Back
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12 col-md-9 border border-dark">
              <div className="row">
                {["Paper Name", "Authors", "Year", "Journal"].map((item) => (
                  <div className="col-sm-6 col-md-4 col-lg-3">
                    <p>
                      <span className="h6">{item}:</span> {row[item]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="col-12">
                <p className="h6">Abstract:</p>
                <p>{row["Abstract"]}</p>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 pl-2">
              {[
                "Scope",
                "Eco-Evo Focus",
                "Metric",
                "Life history",
                "Ecological Loci/Traits",
                "Additional Loci/Traits",
                "Ploidy",
                "Selection",
                "Spatial Structure",
                "Population Size",
                "Ecological Model",
                "Recurrent Mutation",
                "IBS",
              ].map((item) => (
                <div className="row">
                  <p>
                    <span className="h6">{item}:</span> {row[item]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default IndividualPage;
