import React, { useEffect, useState } from "react";
import { notify } from "react-notify-toast";

import Loader from "../../components/loader";

import Basic from "./Basic";
import StyledButton from "../../components/button";
import StyledSection from "../../components/section";
import StyledCard from "../../components/card";
import StyledSelect from "../../components/select";
import { RouteComponentProps } from "react-router-dom";
import apolloClient from "../../../shared/apolloClient";
import { GET_ROLES } from "../../../shared/queries/Queries";
import {
  getRoles_roles,
  getRoles,
} from "../../../shared/queries/types/getRoles";
import {
  createAuthorVariables,
  createAuthor,
} from "../../../shared/queries/types/createAuthor";
import { EnumRoles } from "../../../../types/globalTypes";
import { CREATE_AUTHOR } from "../../../shared/queries/Mutations";

interface ICreateAuthorProps {
  router: RouteComponentProps;
}

const CreateAuthor: React.FC<ICreateAuthorProps> = ({ router }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<getRoles_roles[]>([]);
  const [data, setData] = useState<createAuthorVariables>({
    email: "",
    roleName: EnumRoles.READER,
  });

  const fetchRoles = async () => {
    const { loading, data } = await apolloClient().query<getRoles>({
      query: GET_ROLES,
    });
    if (data) {
      setRoles(data.roles);
    }
    setLoading(loading);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const selectRole = (roleName: EnumRoles) => {
    setData({ ...data, roleName });
  };

  const setOption = (option: string, value: string) => {
    setData({ ...data, [option]: value });
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const result = await apolloClient(true).mutate<
      createAuthor,
      createAuthorVariables
    >({
      mutation: CREATE_AUTHOR,
      variables: {
        ...data,
      },
    });
    if (!result.data) {
      notify.show("There was a problem creating this author", "error");
      return;
    }
    if (result.data.createAuthor.ok) {
      notify.show("Author created", "success");
      router.history.push("/admin/authors");
      return;
    }
    let { errors } = result.data.createAuthor;
    if (errors && errors.length > 0) {
      const errorMessages = errors.map(error => error.message);
      notify.show(errorMessages.join("\n"), "error");
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <StyledSection
      title="Create Author"
      subtitle="Here you can create an author with an appropriate role for your blog"
    >
      <StyledCard title="" subtitle="">
        <React.Fragment>
          <Basic
            data={data}
            updateOption={setOption}
            onRoleChange={selectRole}
          />
          <br />
          <StyledSelect
            bold
            label="Role"
            selected={data.roleName}
            options={roles.map(role => {
              return { name: role.name, value: role.name };
            })}
            onChange={selectRole}
          />

          <br />
          <br />
          <br />
          <StyledButton success onClick={submitData}>
            Create Author
          </StyledButton>
        </React.Fragment>
      </StyledCard>
    </StyledSection>
  );
};

export default CreateAuthor;
