/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { setCurrentPage, setRowsPerPage, openModal, closeModal, setEditState, clearEditState, setSelectedCountry, addStateData, deleteStateData } from '../../../redux/stateSlice';
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useEffect, useState } from "react";
import { useStateContext } from '../../../Context/State.context'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';



const State = () => {
  const dispatch = useDispatch();
  const { getState, getAllCountries, addState, deleteState } = useStateContext()
  const { data: states, pagination, isOpen, countries, editState, selectedCountry } = useSelector((state) => state.state);
  const [stateName, setStateName] = useState('');

  useEffect(() => {
    getState(1, 5)
  }, [])

  useEffect(() => {
    getAllCountries();
  }, [])

  useEffect(() => {
    if (!editState) {
      // Reset state when modal is opened for adding a new state
      dispatch(setSelectedCountry(''));
      setStateName('');
    } else {
      // Set state values when editing an existing state
      dispatch(setSelectedCountry(editState.countryid));
      setStateName(editState.statename);
    }
  }, [editState]);

  const handleSearchChange = () => {
    // Handle search change
  };

  const handleDelete = async (stateId) => {
    try {
      await deleteState(stateId);
      await getState(pagination.currentPage, pagination.rowsPerPage);
    } catch (error) {
      console.error('Error deleting state:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    dispatch(setCurrentPage(newPage + 1));
    getState(newPage + 1, pagination.rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    dispatch(setRowsPerPage(newRowsPerPage));
    getState(1, newRowsPerPage);
  };

  const handleFirstPageButtonClick = () => {
    dispatch(setCurrentPage(1));
    getState(1, pagination.rowsPerPage);
  }

  const handleBackButtonClick = () => {
    const newPage = Math.max(1, pagination.currentPage - 1);
    dispatch(setCurrentPage(newPage));
    getState(newPage, pagination.rowsPerPage);
  }

  const handleNextButtonClick = () => {
    const newPage = Math.min(pagination.totalPages, pagination.currentPage + 1);
    dispatch(setCurrentPage(newPage));
    getState(newPage, pagination.rowsPerPage);
  }

  const handleLastPageButtonClick = () => {
    dispatch(setCurrentPage(pagination.totalPages));
    getState(pagination.totalPages, pagination.rowsPerPage);
  }

  const handleOpenModal = () => {
    dispatch(openModal());
    dispatch(clearEditState())
    dispatch(setSelectedCountry(''));
  };

  const handleSave = async () => {
    try {
      // Call the API to add state data
      await addState(stateName, selectedCountry);

      // Update the Redux store with the new state data
      dispatch(addStateData({ stateName, countryId: selectedCountry }));

      getState(pagination.currentPage, pagination.rowsPerPage)
      // Close the modal or perform other necessary actions
      dispatch(closeModal());
      dispatch(clearEditState());
    } catch (error) {
      console.error('Error Adding State:', error);
    }
  };

  const handleCancel = () => {
    dispatch(clearEditState());
    dispatch(closeModal());
  };

  const handleEdit = (state) => {
    dispatch(setEditState(state));
    dispatch(openModal());
  };

  const handleStateNameChange = (event) => {
    setStateName(event.target.value);
  };

  const handleCountryChange = (event) => {
    dispatch(setSelectedCountry(event.target.value));
  }

  return (
    <div>
      <div className="mb-3">
        <div className="w-[100%] flex justify-between">
          <div className="input-group w-[300px] gap-2">
            <input
              type="search"
              className="form-control rounded border-black-400 bg-transparent"
              placeholder="Search"
              aria-label="Search"
              aria-describedby="search-addon"
              onChange={handleSearchChange}
            />
          </div>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => handleOpenModal()}
          >
            Add State
          </button>
        </div>

        <Dialog open={isOpen} onClose={handleCancel}>
          <DialogTitle>{editState ? 'Edit State' : 'Add State'}</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Select Option"
              value={selectedCountry}
              onChange={handleCountryChange}
              fullWidth
              margin="normal"
              disabled={editState ? true : false}
            >
              {countries.map((country) => (
                <MenuItem key={country.countryid} value={country.countryid}>
                  {country.countryname}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="State Name"
              value={stateName}
              onChange={handleStateNameChange}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

      </div>
      <TableContainer component={Paper} style={{ maxHeight: pagination.rowsPerPage > 5 || pagination.rowsPerPage === -1 ? '400px' : 'none', overflowY: 'auto' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead className="sticky top-0 bg-white">
            <TableRow>
              <TableCell>Country Name</TableCell>
              <TableCell>State ID</TableCell>
              <TableCell>State Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {states.map((state) =>(
              <TableRow key={state.stateId}> {/* Use stateId as the key */}
                <TableCell>{state.countryname}</TableCell>
                <TableCell>{state.stateid}</TableCell>
                <TableCell>{state.statename}</TableCell>
                <TableCell>
                  <button className="text-blue-600 hover:underline mr-2 font-bold" onClick={() => handleEdit(state)}>Edit</button>
                  <button className="text-red-500 hover:underline font-bold" onClick={() => handleDelete(state.stateid)}>Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
        <div className="sticky bottom-0 bg-white z-10">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={Number(pagination.finalTotal)}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.currentPage - 1} // Adjusted to 0-based index
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={() => (
              <div style={{ flexShrink: 0, ml: 2.5 }}>
                <IconButton onClick={handleFirstPageButtonClick} disabled={pagination.currentPage === 1 || pagination.rowsPerPage === -1} aria-label="first page">
                  <FirstPage />
                </IconButton>
                <IconButton onClick={handleBackButtonClick} disabled={pagination.currentPage === 1 || pagination.rowsPerPage === -1} aria-label="previous page">
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton onClick={handleNextButtonClick} disabled={pagination.currentPage === pagination.totalPages || pagination.rowsPerPage === -1} aria-label="next page">
                  <KeyboardArrowRight />
                </IconButton>
                <IconButton onClick={handleLastPageButtonClick} disabled={pagination.currentPage === pagination.totalPages || pagination.rowsPerPage === -1} aria-label="last page">
                  <LastPage />
                </IconButton>
              </div>
            )}
          />
        </div>

      </TableContainer>
    </div>
  );
};

export default State;
